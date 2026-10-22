import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
    },
    {
        _id: true,
    }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "usermodal",
            required: true,
            unique: true,
        },
        items: {
            type: [cartItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export type CartItem = InferSchemaType<typeof cartItemSchema>;
export type CartRecord = InferSchemaType<typeof cartSchema>;

const CartModel = mongoose.model("cart", cartSchema);

export default CartModel;