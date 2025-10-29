import authRepository from "../auth/auth.repository";
import { createReward, getPoint } from "./points.repository";

export async function getMyPoint(req, res, next) {
  try {
    const userId = req.auth.userId;
    const user = await authRepository.findById(userId);

    const result = await getPoint(user);
    if (!result) {
      const error = new Error("해당 유저가 없거나, 유저의 포인트 정보 없음");
      error.code = 400;
      throw error;
    }

    return res.status(200).json({ points: result });
  } catch (err) {
    next(err);
  }
}

export async function reward(req, res, next) {
  try {
    const userId = req.auth.userId;
    const user = await authRepository.findById(userId);
    const amount = req.body.amount;

    const result = await createReward(user, amount);
    if (!result) {
      const error = new Error("해당 유저가 없거나, 유저의 포인트 정보 없음");
      error.code = 400;
      throw error;
    }

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
