type QueryError = {
  code?: string;
  message?: string;
} | null;

type QueryResult<T> = {
  data: T;
  error: QueryError;
};

/**
 * 게이지 컬럼이 아직 DB(또는 PostgREST 스키마 캐시)에 없는지 판별한다.
 * 제약 조건 오류처럼 컬럼 이름이 들어간 다른 실패는 제외한다.
 */
const isMissingGaugeColumnError = (error: QueryError) => {
  if (!error) {
    return false;
  }

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  const mentionsGaugeColumn =
    message.includes("gauge_stitches") || message.includes("gauge_rows");

  if (!mentionsGaugeColumn) {
    return false;
  }

  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
};

/**
 * 저장 payload에 실제 게이지 값이 들어 있는지 확인한다.
 */
const payloadHasGaugeValue = (payload: Record<string, unknown>) => {
  return payload.gauge_stitches != null || payload.gauge_rows != null;
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
 * 게이지 컬럼이 없을 때의 저장을 처리한다.
 * 게이지 값이 있으면 조용히 버리지 않고 사용자에게 알린다.
 */
const writeWithGaugeFallback = async <T>(
  run: (payload: Record<string, unknown>) => PromiseLike<QueryResult<T>>,
  payload: Record<string, unknown>
): Promise<QueryResult<T>> => {
  const first = await run(payload);
  if (!(first.error && isMissingGaugeColumnError(first.error))) {
    return first;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[게이지 컬럼이 없어 저장하지 못합니다]", first.error.message);
  }

  if (payloadHasGaugeValue(payload)) {
    throw new Error(
      "게이지를 저장하지 못했어요. 작품의 다른 정보도 아직 저장되지 않았어요. 잠시 후 다시 시도해 주세요."
    );
  }

  const rest = { ...payload };
  delete rest.gauge_stitches;
  delete rest.gauge_rows;
  return run(rest);
};

export {
  isMissingGaugeColumnError,
  selectWithGaugeFallback,
  writeWithGaugeFallback,
};
