import { Router } from "express";
import * as controller from "./sales.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getMySalesSchema } from "./validators/sales.validators.js";

const router = Router();

router.get(
  "/my-photo-cards/sales",
  validate(getMySalesSchema),
  controller.getMySales
);

export default router;
