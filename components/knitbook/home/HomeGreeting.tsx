"use client";

type HomeGreetingProps = {
  nickname: string;
};

/** 한국 날짜 기준으로 매일 하나씩 돌아가는 뜨개 인사 */
const GREETING_LINES = [
  "오늘 뜨개 운빨 미쳤어요🍀",
  "코는 예쁘게, 인생은 술술이에요✨",
  "실도 인생도 안 엉키길 바랄게요🧶",
  "오늘도 뜨개력 만렙 찍어요🔥",
  "풀림 없이 꽃길만 뜨세요🌸",
  "한 코 한 코, 행복 적립하세요💰",
  "오늘의 운세: 뜨개 대성공이에요💫",
  "실은 잡고, 행운도 잡으세요🍀",
  "코가 맞으면 인생도 맞아요✨",
] as const;

/**
 * 한국 날짜를 YYYY-MM-DD로 돌려준다.
 */
const getKoreaDateKey = (now: Date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};

/**
 * 한국 날짜를 기준으로 오늘 인사말 번호를 고른다.
 */
const getDailyGreetingIndex = () => {
  const [year, month, day] = getKoreaDateKey(new Date()).split("-").map(Number);
  const koreaDay = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  return Math.abs(koreaDay) % GREETING_LINES.length;
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
