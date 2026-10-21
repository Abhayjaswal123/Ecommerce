import { type Request, type Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import ProductModel, {
  productCategories,
  type ProductCategory,
  type ProductRecord,
} from "../model/product.model.js";

const parseProductCategory = (value: unknown): ProductCategory | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return productCategories.find((category) => category === trimmedValue);
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

    const {
      name,
      img,
      description,
      price,
      quantity,
      category,
    } = req.body;

    const product = await ProductModel.create({
      name,
      img,
      description,
      price,
      quantity,
      category,
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
      filter.quantity = { $gt: 5 };
    } else if (stock === "low-stock") {
      filter.quantity = { $gt: 0, $lte: 5 };
    } else if (stock === "out-of-stock") {
      filter.quantity = 0;
    }

    // Fetch matching public products
    const storedProducts = await ProductModel.find(filter)
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

    // Top 4 products by likes
    const topProducts = [...likedProducts]
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 4);

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
      filter.quantity = { $gt: 5 };
    } else if (stock === "low-stock") {
      filter.quantity = { $gt: 0, $lte: 5 };
    } else if (stock === "out-of-stock") {
      filter.quantity = 0;
    }

    const storedProducts = await ProductModel.find(filter)
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
    const { name, img, description, price, quantity, category } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await ProductModel.findOneAndUpdate(
      {
        _id: id,
        vendor: vendorId,
      },
      { name, img, description, price, quantity, category },
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