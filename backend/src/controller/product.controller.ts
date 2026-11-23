import { type Request, type Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import ProductModel, {
  productCategories,
  type ProductCategory,
  type ProductRecord,
} from "../model/product.model.js";

type ProductVariantInput = {
  size: string;
  color: string;
  img: string;
  price: number;
  quantity: number;
};

type ProductInput = {
  name: string;
  description: string;
  category: ProductCategory;
  variants: ProductVariantInput[];
};

const parseProductCategory = (value: unknown): ProductCategory | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return productCategories.find((category) => category === trimmedValue);
};

const isValidProductNumber = (value: unknown) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0;

const validateProductInput = (
  body: Request["body"]
):
  | { valid: true; input: ProductInput }
  | { valid: false; message: string } => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const category = parseProductCategory(body.category);

  if (!name) {
    return { valid: false, message: "Product name is required." };
  }

  if (!category) {
    return { valid: false, message: "Valid product category is required." };
  }

  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    return { valid: false, message: "At least one product variant is required." };
  }

  const variants: ProductVariantInput[] = [];

  for (const variant of body.variants) {
    if (!variant || typeof variant !== "object") {
      return { valid: false, message: "Invalid product variant." };
    }

    const size = typeof variant.size === "string" ? variant.size.trim() : "";
    const color = typeof variant.color === "string" ? variant.color.trim() : "";
    const img = typeof variant.img === "string" ? variant.img.trim() : "";

    const price = Number(variant.price);
    const quantity = Number(variant.quantity);

    if (!color) {
      return { valid: false, message: "Variant color is required." };
    }

    if (
      !isValidProductNumber(price) ||
      !isValidProductNumber(quantity) ||
      !Number.isInteger(quantity)
    ) {
      return {
        valid: false,
        message: "Variant price and quantity must be valid non-negative numbers.",
      };
    }

    variants.push({
      size,
      color,
      img,
      price,
      quantity,
    });
  }

  return {
    valid: true,
    input: {
      name,
      description,
      category,
      variants,
    },
  };
};
export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const validation = validateProductInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const product = await ProductModel.create({
      ...validation.input,
      vendor: vendorId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const { search, category, stock } = req.query;

    // Validate search
    if (search !== undefined && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid search filter.",
      });
    }

    // Validate category
    const categoryValue = parseProductCategory(category);

    if (category !== undefined && !categoryValue) {
      return res.status(400).json({
        success: false,
        message: "Invalid category filter.",
      });
    }

    // Validate stock
    if (
      stock !== undefined &&
      stock !== "all" &&
      stock !== "in-stock" &&
      stock !== "low-stock" &&
      stock !== "out-of-stock"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock filter.",
      });
    }

    // Build query filter (public products from all vendors)
    const searchText =
      typeof search === "string" ? search.trim() : "";

    const escapedSearch = searchText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const filter: QueryFilter<ProductRecord> = {};

    if (escapedSearch) {
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        {
          description: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (categoryValue) {
      filter.category = categoryValue;
    }

    if (stock === "in-stock") {
      filter["variants.quantity"] = { $gt: 5 };
    } else if (stock === "low-stock") {
      filter["variants.quantity"] = { $gt: 0, $lte: 5 };
    } else if (stock === "out-of-stock") {
      filter["variants.quantity"] = 0;
    }

    // Fetch matching public products
    const storedProducts = await ProductModel.find(filter)
      .read("primary")
      .select("+likedBy -__v")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate likes without exposing likedBy
    const products = storedProducts.map(
      ({ likedBy, ...product }) => ({
        ...product,
        likesCount: likedBy?.length ?? 0,
        isLiked: likedBy?.some(
          (userId) => userId.toString() === req.user?.id
        ) ?? false,
      })
    );

    // Products with likes
    const likedProducts = products.filter(
      (product) => product.likesCount > 0
    );

    // Top products by likes
    const topProducts = [...likedProducts]
      .sort((a, b) => b.likesCount - a.likesCount);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      products,
      topProducts,
      likedProducts,
    });
  } catch (error) {
    console.error("Fetch products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

export const getVendorProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { search, category, stock } = req.query;

    if (search !== undefined && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid search filter.",
      });
    }

    const categoryValue = parseProductCategory(category);
    if (category !== undefined && !categoryValue) {
      return res.status(400).json({
        success: false,
        message: "Invalid category filter.",
      });
    }

    if (
      stock !== undefined &&
      stock !== "all" &&
      stock !== "in-stock" &&
      stock !== "low-stock" &&
      stock !== "out-of-stock"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock filter.",
      });
    }

    const searchText = typeof search === "string" ? search.trim() : "";
    const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter: QueryFilter<ProductRecord> = { vendor: vendorId };
    if (escapedSearch) {
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    if (categoryValue) {
      filter.category = categoryValue;
    }
    if (stock === "in-stock") {
      filter["variants.quantity"] = { $gt: 5 };
    } else if (stock === "low-stock") {
      filter["variants.quantity"] = { $gt: 0, $lte: 5 };
    } else if (stock === "out-of-stock") {
      filter["variants.quantity"] = 0;
    }

    const storedProducts = await ProductModel.find(filter)
      .read("primary")
      .select("+likedBy")
      .sort({ createdAt: -1 })
      .lean();

    const products = storedProducts.map(({ likedBy, ...product }) => ({
      ...product,
      likesCount: likedBy?.length ?? 0,
    }));
    const likedProducts = products.filter((product) => product.likesCount > 0);
    const topProducts = [...likedProducts]
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      message: "Vendor products fetched successfully.",
      products,
      topProducts,
      likedProducts,
    });
  } catch (error) {
    console.error("Fetch vendor products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor products.",
    });
  }
};

export const likeProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $addToSet: { likedBy: userId } },
      { new: true },
    )
      .select("+likedBy")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      liked: true,
      likesCount: product.likedBy?.length ?? 0,
    });
  } catch (error) {
    console.error("Like product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like product.",
    });
  }
};

export const unlikeProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $pull: { likedBy: userId } },
      { new: true },
    )
      .select("+likedBy")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      liked: false,
      likesCount: product.likedBy?.length ?? 0,
    });
  } catch (error) {
    console.error("Unlike product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unlike product.",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const validation = validateProductInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const product = await ProductModel.findOneAndUpdate(
      {
        _id: id,
        vendor: vendorId,
      },
      validation.input,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await ProductModel.findOneAndDelete({
      _id: id,
      vendor: vendorId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};