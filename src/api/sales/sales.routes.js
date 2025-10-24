import { Router } from "express";
import * as controller from "./sales.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getMySalesSchema } from "./validators/sales.validators.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";

const router = Router();

router.get(
  "/my-photo-cards/sales",
  verifyAccessToken,
  validate(getMySalesSchema),
  controller.getMySales
);

export default router;
