import type { Request, Response } from "express";
import mongoose from "mongoose";
import CartModel from "../model/cart.model.js";
import ProductModel from "../model/product.model.js";

const populateCart = (query: ReturnType<typeof CartModel.findById>) =>
    query.populate({
        path: "items.product",
        populate: {
            path: "vendor",
            select: "username email",
        },
    });

// GET CART
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        const cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(200).json({
                message: "Cart retrieved successfully",
                cart: { items: [] },
            });
        }

        const populatedCart = await populateCart(CartModel.findById(cart._id));

        return res.status(200).json({
            message: "Cart retrieved successfully",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ADD TO CART
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.params;
        const quantity = Number(req.body.quantity ?? 1);

        if (!userId) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
            });
        }

        // Check whether the product exists
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Find the user's cart or create one
        let cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartModel({
                user: userId,
                items: [],
            });
        }

        // Check if this product is already in the cart
        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = existingItem
            ? existingItem.quantity + quantity
            : quantity;

        // Check available stock
        if (newQuantity > product.quantity) {
            return res.status(400).json({
                message: `Only ${product.quantity} units are available`,
            });
        }

        if (existingItem) {
            // Increase quantity if product already exists
            existingItem.quantity = newQuantity;
        } else {
            // Add a new product to the cart
            cart.items.push({
                product: product._id,
                quantity,
            });
        }

        await cart.save();

        const updatedCart = await CartModel.findById(cart._id)
            .populate({
                path: "items.product",
                populate: {
                    path: "vendor",
                    select: "username email",
                },
            });

        return res.status(200).json({
            message: "Product added to cart successfully",
            cart: updatedCart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!userId) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
            });
        }

        const [cart, product] = await Promise.all([
            CartModel.findOne({ user: userId }),
            ProductModel.findById(productId),
        ]);

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const item = cart.items.find(
            (cartItem) => cartItem.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product is not in your cart",
            });
        }

        if (quantity > product.quantity) {
            return res.status(400).json({
                message: `Only ${product.quantity} units are available`,
            });
        }

        item.quantity = quantity;
        await cart.save();

        const updatedCart = await populateCart(CartModel.findById(cart._id));

        return res.status(200).json({
            message: "Cart quantity updated successfully",
            cart: updatedCart,
        });
    } catch (error) {
        console.error("Update cart quantity error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// REMOVE FROM CART
export const removeFromCart = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        // Remove only from the authenticated user's cart
        const cart = await CartModel.findOneAndUpdate(
            { user: userId },
            {
                $pull: {
                    items: {
                        product: new mongoose.Types.ObjectId(productId),
                    },
                },
            },
            { new: true }
        ).populate({
            path: "items.product",
            populate: {
                path: "vendor",
                select: "username email",
            },
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        return res.status(200).json({
            message: "Product removed from cart successfully",
            cart,
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};