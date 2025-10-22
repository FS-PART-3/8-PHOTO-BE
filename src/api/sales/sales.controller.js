// src/controllers/photocardController.js
import * as salesService from "./sales.service.js";

const MOCK_USER_ID = "user2"; // 임시 유저 ID임

/**
 * GET /api/photocards/my/sales 요청 처리
 */
export const getMySales = async (req, res) => {
  try {
    // 쿼리 파라미터 추출
    const { search, grade, genre, status, soldOut, page, limit } = req.query;

    // Service 호출 시 필터링 파라미터 모두 전달
    const result = await salesService.getMySalesPhotocards(
      MOCK_USER_ID,
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
    console.error("Error in getMySales:", error);
    res
      .status(500)
      .json({ error: "서버에서 데이터를 가져오는 데 실패했습니다." });
  }
};
