import type { Request, Response } from "express";
import mongoose from "mongoose";
import CartModel from "../model/cart.model.js";
import OrderModel, { orderStatuses } from "../model/order.model.js";
import ProductModel from "../model/product.model.js";
import { invalidateCartCache } from "../utils/cartCache.js";

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 80;

class OrderTransitionError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (req.body?.paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Cash on delivery is the only available payment method.",
      });
    }

    const cart = await CartModel.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const products = await ProductModel.find({
      _id: { $in: cart.items.map((item) => item.product) },
    }).read("primary");
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );
    const groups = new Map<
      string,
      {
        vendor: mongoose.Types.ObjectId;
        items: {
          product: mongoose.Types.ObjectId;
          name: string;
          img: string;
          unitPrice: number;
          quantity: number;
        }[];
        subtotal: number;
      }
    >();

    for (const cartItem of cart.items) {
      const product = productsById.get(cartItem.product.toString());
      if (!product || product.quantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: product
            ? `Only ${product.quantity} units of ${product.name} are available.`
            : "A product in your cart is no longer available.",
        });
      }

      const vendorId = product.vendor.toString();
      const group = groups.get(vendorId) ?? {
        vendor: product.vendor,
        items: [],
        subtotal: 0,
      };
      group.items.push({
        product: product._id,
        name: product.name,
        img: product.img,
        unitPrice: product.price,
        quantity: cartItem.quantity,
      });
      group.subtotal += product.price * cartItem.quantity;
      groups.set(vendorId, group);
    }

    const orders = await OrderModel.insertMany(
      [...groups.values()].map((group) => {
        const shipping =
          group.subtotal === 0 || group.subtotal >= FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_FEE;
        return {
          user: userId,
          vendor: group.vendor,
          items: group.items,
          subtotal: group.subtotal,
          shipping,
          total: group.subtotal + shipping,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          status: "Pending",
        };
      })
    );

    await CartModel.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );
    await invalidateCartCache(userId);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      orders,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place your order.",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const isVendor = req.user?.role === "vendor";
    const orders = await OrderModel.find(
      isVendor ? { vendor: userId } : { user: userId }
    )
      .read("primary")
      .populate(isVendor ? "user" : "vendor", "username")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?.id;
    const { orderId } = req.params;
    const nextStatus: unknown = req.body.status;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }
    if (typeof orderId !== "string" || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }
    if (
      typeof nextStatus !== "string" ||
      !orderStatuses.includes(nextStatus as (typeof orderStatuses)[number])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const nextAllowedStatus: Record<string, (typeof orderStatuses)[number]> = {
      Pending: "Confirmed",
      Confirmed: "Out for Delivery",
      "Out for Delivery": "Delivered",
    };
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(
        async () => {
          const order = await OrderModel.findOne({
            _id: orderId,
            vendor: vendorId,
          }).session(session);
          if (!order) {
            throw new OrderTransitionError("Order not found.", 404);
          }
          if (nextAllowedStatus[order.status] !== nextStatus) {
            throw new OrderTransitionError(
              "This order cannot move to the requested status.",
              409,
            );
          }

          if (order.status === "Pending" && nextStatus === "Confirmed") {
            for (const item of order.items) {
              const stockUpdate = await ProductModel.updateOne(
                {
                  _id: item.product,
                  vendor: vendorId,
                  quantity: { $gte: item.quantity },
                },
                { $inc: { quantity: -item.quantity } },
                { session },
              );
              if (stockUpdate.matchedCount !== 1) {
                throw new OrderTransitionError(
                  `Insufficient stock for ${item.name}. The order was not accepted.`,
                  409,
                );
              }
            }
          }

          const updated = await OrderModel.findOneAndUpdate(
            { _id: orderId, vendor: vendorId, status: order.status },
            { $set: { status: nextStatus } },
            { new: true, runValidators: true, session },
          );
          if (!updated) {
            throw new OrderTransitionError(
              "The order status changed. Refresh and try again.",
              409,
            );
          }
        },
        { readPreference: "primary" },
      );
    } finally {
      await session.endSession();
    }

    const updatedOrder = await OrderModel.findById(orderId).populate(
      "user",
      "username",
    );
    if (!updatedOrder) {
      throw new OrderTransitionError("Order not found.", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    if (error instanceof OrderTransitionError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};
