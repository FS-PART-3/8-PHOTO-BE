import authRepository from "../auth/auth.repository.js";
import {
  createReward,
  getPointHistory,
  getCurrentPoints,
} from "./points.repository.js";

export async function pointHistory(req, res, next) {
  try {
    const userId = req.auth?.userId;
    const user = await authRepository.findById(userId);

    const result = await getPointHistory(user);
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

export async function points(req, res, next) {
  try {
    const userId = req.auth?.userId;
    const user = await authRepository.findById(userId);

    const result = await getCurrentPoints(user);
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
