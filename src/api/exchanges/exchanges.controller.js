import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./exchanges.service.js";

export const approveExchangeOffer = asyncHandler(async (req, res) => {
  const sellerId = req.user?.id ?? req.auth?.userId;
  if (!sellerId) return res.status(401).json({ message: "Unauthorized" });
  const { offerId } = req.params;

  const result = await service.approveExchangeOffer({ sellerId, offerId });

  return res.status(200).json(result);
});
