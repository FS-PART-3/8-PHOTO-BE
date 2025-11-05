import {
  checkPassword,
  getUserById,
  updateUser,
} from "../auth/auth.service.js";
import { getCurrentPoints } from "../points/points.repository.js";

export async function getUserData(req, res, next) {
  try {
    const userId = req.auth?.userId;
    const user = await getUserById(userId);
    const points = await getCurrentPoints(user);

    const data = {
      ...user,
      points,
    };
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUserName(req, res, next) {
  try {
    const userId = req.auth?.userId;
    const { password, newUserName } = req.body;
    await checkPassword(userId, password);
    await updateUser(userId, { name: newUserName });

    return res.status(201).json({
      ok: true,
      message: "닉네임 변경에 성공했습니다.",
      name: newUserName,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}
