import { type Request, type Response } from "express";
import ProductModel from "../model/product.model.js";

export const createProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, img, discription, price, quantity, category } = req.body;

        const product = await ProductModel.create({
            name,
            img,
            discription,
            price,
            quantity,
            vendor: req.user.id,
            category
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

        const product = await ProductModel.find({})

        return res.status(201).json({
            success: true,
            message: "Products fetched successfully.",
            product,
        });
    } catch (error) {
        console.error("fetching product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product.",
        });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findByIdAndUpdate(
            id,
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
        console.error("Updating product error:", error);

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
        const { id } = req.params;

        const product = await ProductModel.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
            product,
        });
    } catch (error) {
        console.error("Deleting product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product.",
        });
    }
};
