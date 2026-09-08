"use client";

type HomeGreetingProps = {
  nickname: string;
};

/** 이름 아래 한 줄로 두는 짧은 뜨개 인사 */
const GREETING_LINES = [
  "오늘도 한 코씩 천천히",
  "실타래처럼 잘 풀리는 하루",
  "게이지는 맞춰도 마음은 느슨하게",
  "오늘 단수는 기분 좋은 쪽",
  "바늘 소리가 반가운 하루예요",
] as const;

/**
 * 오늘 날짜를 기준으로 인사말 번호를 고른다.
 */
const getDailyGreetingIndex = () => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDay = Math.floor(localMidnight.getTime() / 86_400_000);
  return Math.abs(localDay) % GREETING_LINES.length;
};

/**
 * 날짜마다 바뀌는 뜨개 인사를 이름과 본문으로 나눠 보여 준다.
 */
const HomeGreeting = ({ nickname }: HomeGreetingProps) => {
  const line = GREETING_LINES[getDailyGreetingIndex()];

  return (
    <h1 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
      <span className="block truncate">{nickname}님,</span>
      <span className="block break-keep">{line}</span>
    </h1>
  );
};

export default HomeGreeting;
