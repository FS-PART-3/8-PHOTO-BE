import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { purchaseSchema } from "./validators/products.validators.js";
import * as controller from "./products.controller.js";

const router = Router();

router.post(
  "/marketplace/:listingId/purchase",
  //   authGuard,           //authGuard는 나중에 적용
  validate(purchaseSchema),
  controller.purchase,
);

export default router;
