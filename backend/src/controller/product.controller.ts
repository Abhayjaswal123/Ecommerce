import { type Request, type Response } from "express";
import mongoose from "mongoose";
import ProductModel, { productCategories } from "../model/product.model.js";

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
    // All products for the public shop
    const products = await ProductModel.find()
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      products,
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
    if (
      (search !== undefined && typeof search !== "string") ||
      (category !== undefined && typeof category !== "string") ||
      (stock !== undefined && typeof stock !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Search, category, and stock filters must be single values.",
      });
    }

    const normalizedSearch = search?.trim();
    const normalizedCategory = category?.trim();
    const normalizedStock = stock?.trim();

    if (normalizedSearch && normalizedSearch.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search must be 100 characters or fewer.",
      });
    }

    const isProductCategory = (value: string): value is (typeof productCategories)[number] =>
      productCategories.some((productCategory) => productCategory === value);

    if (normalizedCategory && !isProductCategory(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category filter.",
      });
    }
    const validCategory =
      normalizedCategory && isProductCategory(normalizedCategory)
        ? normalizedCategory
        : undefined;

    if (
      normalizedStock &&
      !["in-stock", "low-stock", "out-of-stock"].includes(normalizedStock)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock filter.",
      });
    }

    type SearchCondition = { $regex: string; $options: "i" };
    const filter: {
      vendor: string;
      $or?: ({ name: SearchCondition } | { description: SearchCondition })[];
      category?: (typeof productCategories)[number];
      quantity?: number | { $gt?: number; $lte?: number };
    } = {
      vendor: vendorId,
    };

    if (normalizedSearch) {
      const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (validCategory) {
      filter.category = validCategory;
    }

    if (normalizedStock === "in-stock") {
      filter.quantity = { $gt: 5 };
    } else if (normalizedStock === "low-stock") {
      filter.quantity = { $gt: 0, $lte: 5 };
    } else if (normalizedStock === "out-of-stock") {
      filter.quantity = 0;
    }

    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Vendor products fetched successfully.",
      products,
    });
  } catch (error) {
    console.error("Fetch vendor products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor products.",
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

    const product = await ProductModel.findOneAndUpdate(
      {
        _id: id,
        vendor: vendorId,
      },
      req.body,
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