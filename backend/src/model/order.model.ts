import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

export const orderStatuses = [
  "Pending",
  "Confirmed",
  "Out for Delivery",
  "Delivered",
] as const;

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default: "",
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodal",
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodal",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      required: true,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      required: true,
      default: "Pending",
    },
    status: {
      type: String,
      enum: orderStatuses,
      required: true,
      default: "Pending",
    },
  },
  { timestamps: true }
);

export type OrderRecord = InferSchemaType<typeof orderSchema>;

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
