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
// 사용법: router.post("/", validate(schema), controller)
