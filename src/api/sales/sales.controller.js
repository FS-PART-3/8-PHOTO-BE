// src/controllers/photocardController.js
import * as salesService from "./sales.service.js";

/**
 * GET /api/photocards/my/sales 요청 처리
 */
export const getMySales = async (req, res, next) => {
  try {
    // 쿼리 파라미터 추출
    const { search, grade, genre, status, soldOut, page, limit } = req.query;
    const userId = req.auth?.userId;

    // Service 호출 시 필터링 파라미터 모두 전달
    const result = await salesService.getMySalesPhotocards(
      userId,
      {
        search,
        grade,
        genre,
        status,
        soldOut,
      },
      page,
      limit
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
