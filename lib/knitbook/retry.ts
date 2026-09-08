/** 일시적 실패를 짧은 간격으로 다시 시도할 때 쓰는 대기 시간(ms) */
const DEFAULT_RETRY_DELAYS_MS = [0, 250, 700];

/**
 * 지정한 시간만큼 기다린다.
 */
const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * 일시적인 실패를 짧은 간격으로 다시 시도한다.
 */
const retryAsync = async <T>(
  operation: () => Promise<T>,
  delaysMs: number[] = DEFAULT_RETRY_DELAYS_MS
): Promise<T> => {
  let lastError: unknown;

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export { retryAsync };
