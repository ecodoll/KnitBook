"use client";

type HomeGreetingProps = {
  nickname: string;
};

const GREETING_TEMPLATES = [
  (name: string) => `${name}님, 오늘도 한 코씩 천천히 떠볼까요?`,
  (name: string) => `${name}님, 실타래처럼 하루가 잘 풀리길 바라요.`,
  (name: string) => `${name}님, 게이지는 맞췄나요? 마음만은 느슨하게.`,
  (name: string) => `${name}님, 오늘 단수는 기분 좋은 쪽이면 충분해요.`,
  (name: string) => `${name}님, 바늘 소리가 반가운 하루 보내세요.`,
] as const;

/**
 * 오늘 날짜를 기준으로 인사말 번호를 고른다.
 */
const getDailyGreetingIndex = () => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDay = Math.floor(localMidnight.getTime() / 86_400_000);
  return Math.abs(localDay) % GREETING_TEMPLATES.length;
};

/**
 * 날짜마다 바뀌는 뜨개 인사말을 사용자 이름과 함께 보여 준다.
 */
const HomeGreeting = ({ nickname }: HomeGreetingProps) => {
  const greeting = GREETING_TEMPLATES[getDailyGreetingIndex()](nickname);

  return (
    <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
      {greeting}
    </h1>
  );
};

export default HomeGreeting;
