import { Router } from "express";
import { searchBusinesses } from "../controllers/search.controller.js";

const router = Router();

router.post("/", searchBusinesses);

export default router;