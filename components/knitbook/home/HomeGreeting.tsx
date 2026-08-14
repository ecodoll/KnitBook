type HomeGreetingProps = {
  nickname: string;
};

/**
 * 홈 상단 인사 문구를 표시한다.
 */
const HomeGreeting = ({ nickname }: HomeGreetingProps) => {
  return (
    <header className="mb-6 space-y-1">
      <p className="text-sm text-muted-foreground">KnitBook</p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        안녕하세요, {nickname}님
      </h1>
    </header>
  );
};

export default HomeGreeting;
