export function validate(schema) {
  return (req, _res, next) => {
    const data = {
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    };

    // multer로 업로드된 파일이 있으면 추가
    if (req.file) {
      data.file = req.file;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      result.error.code = 400;
      return next(result.error);
    }

    // 정제된 데이터를 개별 속성으로 복사
    if (result.data.body) {
      Object.keys(result.data.body).forEach((key) => {
        req.body[key] = result.data.body[key];
      });
    }

    if (result.data.query) {
      Object.keys(result.data.query).forEach((key) => {
        req.query[key] = result.data.query[key];
      });
    }

    if (result.data.params) {
      Object.keys(result.data.params).forEach((key) => {
        req.params[key] = result.data.params[key];
      });
    }

    next();
  };
}

/* 2025.10.22. 수정 전 코드
export function validate(schema) {
  return (req, _res, next) => {
    const data = { body: req.body, query: req.query, params: req.params };
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.code = 400;
      return next(result.error);
    }
    // 정제된 데이터 덮어쓰기 (선택)
    Object.assign(req.body, result.data.body || {});
    Object.assign(req.query, result.data.query || {});
    Object.assign(req.params, result.data.params || {});
    next();
  };
}
*/
// 사용법: router.post("/", validate(schema), controller)
