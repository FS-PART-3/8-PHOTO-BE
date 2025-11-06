/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: 마이갤러리 API
 */

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: 마이갤러리 포토카드 조회
 *     description: 본인이 소유한 포토카드 목록을 조회합니다. 검색, 필터, 정렬, 페이지네이션 기능을 제공합니다.
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이지 번호 (0부터 시작)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 페이지 당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 포토카드 제목 검색
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *         description: 포토카드 등급 필터
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: 포토카드 장르 필터
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, grade, price]
 *           default: createdAt
 *         description: 정렬 기준
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 성공적으로 포토카드 목록을 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       userId:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       title:
 *                         type: string
 *                         example: "스페인 여행"
 *                       grade:
 *                         type: string
 *                         enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                         example: "RARE"
 *                       genre:
 *                         type: string
 *                         example: "풍경"
 *                       price:
 *                         type: integer
 *                         example: 50
 *                       quantity:
 *                         type: integer
 *                         example: 5
 *                       imgUrl:
 *                         type: string
 *                         example: "https://s3.amazonaws.com/bucket/photo-cards/image.jpg"
 *                       description:
 *                         type: string
 *                         example: "RARE 등급의 풍경 테마 카드입니다."
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T08:41:35.557Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T08:41:35.557Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 0
 *                     size:
 *                       type: integer
 *                       example: 12
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /gallery:
 *   post:
 *     summary: 포토카드 생성
 *     description: 새로운 포토카드를 생성합니다. 이미지 파일 업로드가 필수이며, 수수료(가격의 10%)가 차감됩니다. 한 달에 최대 3번까지 생성 가능합니다.
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - title
 *               - grade
 *               - genre
 *               - price
 *               - quantity
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 포토카드 이미지 파일 (필수)
 *               title:
 *                 type: string
 *                 example: "서울 야경"
 *                 description: 포토카드 제목
 *               grade:
 *                 type: string
 *                 enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                 example: "RARE"
 *                 description: 포토카드 등급
 *               genre:
 *                 type: string
 *                 example: "도시"
 *                 description: 포토카드 장르
 *               price:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *                 description: 포토카드 가격 (수수료 10% 차감됨)
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *                 description: 포토카드 수량
 *               description:
 *                 type: string
 *                 example: "서울의 아름다운 야경을 담은 포토카드입니다."
 *                 description: 포토카드 설명
 *     responses:
 *       201:
 *         description: 포토카드 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "[RARE | 서울 야경] 포토카드 생성에 성공했습니다! (수수료: 10P 차감)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     myphoto_id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     user_id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     title:
 *                       type: string
 *                       example: "서울 야경"
 *                     grade:
 *                       type: string
 *                       example: "RARE"
 *                     genre:
 *                       type: string
 *                       example: "도시"
 *                     price:
 *                       type: integer
 *                       example: 100
 *                     quantity:
 *                       type: integer
 *                       example: 10
 *                     imgUrl:
 *                       type: string
 *                       example: "https://s3.amazonaws.com/bucket/photo-cards/image.jpg"
 *                     description:
 *                       type: string
 *                       example: "서울의 아름다운 야경을 담은 포토카드입니다."
 *                     fee:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: 잘못된 요청 (이미지 파일 누락, 포인트 부족, 월간 생성 횟수 초과 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "한 달에 최대 3번까지만 포토카드를 생성할 수 있습니다."
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류 (이미지 업로드 실패 등)
 */
