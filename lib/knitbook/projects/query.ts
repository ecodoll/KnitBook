type QueryError = {
  code?: string;
  message?: string;
} | null;

type QueryResult<T> = {
  data: T;
  error: QueryError;
};

/**
 * 게이지 컬럼이 아직 DB에 없는지 판별한다.
 */
const isMissingGaugeColumnError = (error: QueryError) => {
  if (!error) {
    return false;
  }

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("gauge_stitches") ||
    message.includes("gauge_rows")
  );
};

/**
 * 게이지 컬럼이 없으면 기본 컬럼으로 같은 조회를 다시 한다.
 */
const selectWithGaugeFallback = async <T>(
  run: (columns: string) => PromiseLike<QueryResult<T>>,
  columns: { primary: string; fallback: string }
): Promise<QueryResult<T>> => {
  const first = await run(columns.primary);
  if (first.error && isMissingGaugeColumnError(first.error)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[게이지 컬럼이 없어 기본 컬럼으로 다시 불러옵니다]", first.error.message);
    }
    return run(columns.fallback);
  }

  return first;
};

/**
 * 게이지 컬럼이 없으면 해당 필드를 빼고 다시 저장한다.
 */
const writeWithGaugeFallback = async <T>(
  run: (payload: Record<string, unknown>) => PromiseLike<QueryResult<T>>,
  payload: Record<string, unknown>
): Promise<QueryResult<T>> => {
  const first = await run(payload);
  if (first.error && isMissingGaugeColumnError(first.error)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[게이지 컬럼이 없어 게이지 없이 저장합니다]", first.error.message);
    }
    const rest = { ...payload };
    delete rest.gauge_stitches;
    delete rest.gauge_rows;
    return run(rest);
  }

  return first;
};

export {
  isMissingGaugeColumnError,
  selectWithGaugeFallback,
  writeWithGaugeFallback,
};
