import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

export const productCategories = [
  "Electronics",
  "Clothing",
  "Footwear",
  "Home & Kitchen",
  "Beauty",
  "Books",
  "Sports",
  "Accessories",
  "Other",
] as const;

export type ProductCategory = (typeof productCategories)[number];

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      required: true,
    },
    img: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: true }
)

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: productCategories,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodal",
      required: true,
    },
    likedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "usermodal",
        },
      ],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export type ProductRecord = InferSchemaType<typeof productSchema>;

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;