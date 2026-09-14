/**
 * Auth 오류 객체에서 원문 메시지를 꺼낸다.
 */
const readAuthErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
};

/**
 * 비밀번호·재설정 관련 Supabase 오류를 사용자용 한글로 바꾼다.
 */
const getPasswordAuthErrorMessage = (error: unknown, fallback: string) => {
  const rawMessage = readAuthErrorMessage(error);
  const normalized = rawMessage.toLowerCase();

  if (rawMessage.includes("이미 가입된") || /[가-힣]/.test(rawMessage)) {
    return rawMessage;
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "현재 비밀번호가 올바르지 않아요.";
  }

  if (normalized.includes("same password") || normalized.includes("should be different")) {
    return "지금과 다른 비밀번호로 입력해 주세요.";
  }

  if (normalized.includes("password") && normalized.includes("least")) {
    return "비밀번호는 8자 이상으로 입력해 주세요.";
  }

  if (
    normalized.includes("invalid email") ||
    normalized.includes("unable to validate email")
  ) {
    return "이메일 형식을 확인해 주세요.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("otp_expired") ||
    normalized.includes("token has expired") ||
    normalized.includes("invalid token") ||
    normalized.includes("flow state")
  ) {
    return "재설정 링크가 만료되었어요. 로그인 화면에서 다시 요청해 주세요.";
  }

  return fallback;
};

export { getPasswordAuthErrorMessage, readAuthErrorMessage };
