/**
 * 랜딩 히어로에 뜨개 기록장 미리보기를 장식으로 보여 준다.
 */
const LandingHeroVisual = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-secondary/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-6 size-24 rounded-full bg-accent/60"
        aria-hidden
      />

      <div className="relative z-10 space-y-4">
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-6 overflow-hidden rounded-full border border-border bg-primary" />
            <span className="flex size-6 overflow-hidden rounded-full border border-border bg-brand-berry" />
            <span className="flex size-6 overflow-hidden rounded-full border border-border bg-brand-warning" />
            <p className="text-sm text-foreground">Moss Heather · LOT 2411</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          암홀 시작 전 · 넥은 한 사이즈 넓힘
        </p>
      </div>
    </div>
  );
};

export default LandingHeroVisual;
