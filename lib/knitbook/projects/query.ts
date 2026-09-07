import { applyGaugeWriteFallback } from "./gauge";

type QueryError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null;

type QueryResult<T> = {
  data: T;
  error: QueryError;
};

/** 조회·저장 과정에서 게이지 컬럼 사용 가능 여부를 기억한다. */
let gaugeColumnsAvailable: boolean | null = null;

/**
 * 게이지 컬럼 사용 가능 여부를 기록한다.
 */
const markGaugeColumnsAvailable = (available: boolean) => {
  gaugeColumnsAvailable = available;
};

/**
 * 오류 본문을 한 문자열로 모은다.
 */
const combinedErrorText = (error: QueryError) => {
  if (!error) {
    return "";
  }

  return [error.message, error.details, error.hint]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();
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
  const message = combinedErrorText(error);
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
 * 게이지 컬럼이 없으면 기본 컬럼으로 같은 조회를 다시 한다.
 */
const selectWithGaugeFallback = async <T>(
  run: (columns: string) => PromiseLike<QueryResult<T>>,
  columns: { primary: string; fallback: string }
): Promise<QueryResult<T>> => {
  const first = await run(columns.primary);
  if (first.error && isMissingGaugeColumnError(first.error)) {
    markGaugeColumnsAvailable(false);
    if (process.env.NODE_ENV === "development") {
      console.warn("[게이지 컬럼이 없어 기본 컬럼으로 다시 불러옵니다]", first.error.message);
    }
    return run(columns.fallback);
  }

  if (!first.error) {
    markGaugeColumnsAvailable(true);
  }

  return first;
};

/**
 * 게이지 컬럼이 없을 때의 저장을 처리한다.
 * 게이지 값이 있으면 메모 사이드카로 옮겨 작품의 다른 정보와 함께 저장한다.
 */
const writeWithGaugeFallback = async <T>(
  run: (payload: Record<string, unknown>) => PromiseLike<QueryResult<T>>,
  payload: Record<string, unknown>
): Promise<QueryResult<T>> => {
  const runWithoutGaugeColumns = () => run(applyGaugeWriteFallback(payload));

  if (gaugeColumnsAvailable === false) {
    return runWithoutGaugeColumns();
  }

  const first = await run(payload);
  if (!(first.error && isMissingGaugeColumnError(first.error))) {
    if (!first.error) {
      markGaugeColumnsAvailable(true);
    }
    return first;
  }

  markGaugeColumnsAvailable(false);
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[게이지 컬럼이 없어 메모 사이드카로 저장합니다]",
      first.error.message
    );
  }

  return runWithoutGaugeColumns();
};

export {
  isMissingGaugeColumnError,
  selectWithGaugeFallback,
  writeWithGaugeFallback,
};
