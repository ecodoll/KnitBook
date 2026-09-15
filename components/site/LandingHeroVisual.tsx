/**
 * 랜딩 히어로에 뜨개 기록장 미리보기를 장식으로 보여 준다.
 */
const LandingHeroVisual = () => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
      aria-hidden
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-secondary/80" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 size-24 rounded-full bg-accent/70" />

      <div className="relative space-y-4">
        <p className="text-xs font-medium tracking-wide text-primary">
          기록 미리보기
        </p>
        <p className="font-heading text-lg font-semibold text-foreground">
          세일러 칼라 베스트
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-secondary/70 px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">오늘 위치</dt>
            <dd className="mt-1 font-heading text-xl font-semibold text-foreground">
              42단
            </dd>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">게이지</dt>
            <dd className="mt-1 font-heading text-xl font-semibold text-foreground">
              18×24
            </dd>
          </div>
        </dl>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">사용 중인 실</p>
          <div className="flex items-center gap-2">
            <span className="flex size-6 overflow-hidden rounded-full border border-border">
              <span className="size-full bg-primary" />
            </span>
            <span className="flex size-6 overflow-hidden rounded-full border border-border">
              <span className="size-full bg-brand-berry" />
            </span>
            <span className="flex size-6 overflow-hidden rounded-full border border-border">
              <span className="size-full bg-brand-warning" />
            </span>
            <p className="text-sm text-foreground">Moss Heather · LOT 2411</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          암홀 시작 전. 넥은 한 사이즈 넓힘. 스와치는 물세탁 후 측정.
        </p>
      </div>
    </div>
  );
};

export default LandingHeroVisual;
