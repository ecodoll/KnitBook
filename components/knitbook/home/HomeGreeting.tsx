type HomeGreetingProps = {
  nickname: string;
};

/**
 * 홈 본문 상단 인사 문구를 표시한다.
 */
const HomeGreeting = ({ nickname }: HomeGreetingProps) => {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        안녕하세요, {nickname}님
      </h1>
    </div>
  );
};

export default HomeGreeting;
