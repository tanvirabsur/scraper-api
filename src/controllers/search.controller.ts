import type { Request, Response } from "express";
import { scrapeBusinesses } from "../services/scraper.service.js";

export const searchBusinesses = async (
  req: Request,
  res: Response
) => {
  try {
    const searchQuery =
      typeof req.query.query === "string"
        ? req.query.query.trim()
        : "";

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 10;

    const businesses = await scrapeBusinesses(
      searchQuery,
      Number.isFinite(limit) ? limit : 10
    );

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown Error",
    });
  }
};