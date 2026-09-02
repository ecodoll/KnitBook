type HomeGreetingProps = {
  nickname: string;
};

/**
 * 홈 본문 상단 인사 문구를 짧게 표시한다.
 */
const HomeGreeting = ({ nickname }: HomeGreetingProps) => {
  return (
    <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
      안녕하세요, {nickname}님
    </h1>
  );
};

export default HomeGreeting;
