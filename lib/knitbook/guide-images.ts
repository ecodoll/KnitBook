/**
 * 공개 가이드에 쓰는 히어로·본문 그림 정보를 보관한다.
 */

export type GuideFigureData = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const HERO_SIZE = { width: 1280, height: 720 } as const;
const INLINE_SIZE = { width: 1152, height: 864 } as const;

/**
 * 히어로 그림 항목을 만든다.
 */
const hero = (file: string, alt: string, caption: string): GuideFigureData => {
  return {
    src: `/guides/${file}`,
    alt,
    caption,
    ...HERO_SIZE,
  };
};

/**
 * 본문 중간 그림 항목을 만든다.
 */
const inline = (file: string, alt: string, caption: string): GuideFigureData => {
  return {
    src: `/guides/${file}`,
    alt,
    caption,
    ...INLINE_SIZE,
  };
};

const GUIDE_HEROES: Record<string, GuideFigureData> = {
  "knitting-slang": hero(
    "knitting-slang-unravel-hero.jpg",
    "린넨 위에 풀리기 시작한 세이지 그린 뜨개와 나무 바늘",
    "푸르시오는 해리 포터의 크루시오를 희화화한 말입니다. 코를 풀고 다음 단을 다시 고르는 주문입니다."
  ),
  "gauge-swatch": hero(
    "gauge-swatch-hero.jpg",
    "린넨 위에 펼친 세이지 그린 게이지 스와치와 나무 자",
    "측정할 면적보다 크게 뜬 스와치. 가장자리가 아니라 안쪽을 재는 것이 기본입니다."
  ),
  "read-yarn-label": hero(
    "read-yarn-label-hero.jpg",
    "라벨이 달린 베리 핑크 실 타래와 나무 대바늘",
    "라벨에는 무게, 길이, 바늘, LOT가 있습니다. 타래에서 바로 떼지 않는 편이 좋습니다."
  ),
  "project-journal": hero(
    "project-journal-hero.jpg",
    "진행 중인 뜨개 작품과 옆에 펼쳐 둔 기록 수첩",
    "단수만이 아니라 실, 바늘, 도안과 다르게 처리한 부분을 같이 남깁니다."
  ),
  "yarn-stash-reset": hero(
    "yarn-stash-reset-hero.jpg",
    "바구니와 나무 상자에 나눠 담은 여러 색의 실 타래",
    "예쁨이 아니라 상태와 미터로 먼저 나누면 재고가 부담으로 남지 않습니다."
  ),
  "pattern-pdf-care": hero(
    "pattern-pdf-care-hero.jpg",
    "태블릿과 출력한 도안, 실이 놓인 작업 책상",
    "원본 파일 한 곳, 뜨는 중 보는 사본 한 곳으로 나누면 잃어버릴 일이 줄어듭니다."
  ),
  "beginner-kit": hero(
    "beginner-kit-hero.jpg",
    "대바늘, 가위, 코 마커, 자와 실이 가지런히 놓인 입문 준비물",
    "첫 작품에 필요한 것만 챙기면 됩니다. 세트부터 모을 필요는 없습니다."
  ),
  "blocking-finish": hero(
    "blocking-finish-hero.jpg",
    "블로킹 매트 위에 핀으로 고정한 젖은 뜨개 패널",
    "코를 고르게 펴는 과정입니다. 게이지가 크게 어긋난 옷을 한 치수 바꾸는 마법은 아닙니다."
  ),
  "choose-needles": hero(
    "choose-needles-hero.jpg",
    "대바늘, 줄바늘, 코바늘과 실을 린넨 위에 나란히 둔 모습",
    "도구는 도안이 정한 호수와 뜨는 방식에 맞추어 한두 개부터 고릅니다."
  ),
  "needle-types": hero(
    "needle-types-hero.jpg",
    "실과 직선 대바늘, 줄바늘, 양끝바늘, 코바늘을 린넨 위에 나란히 둔 모습",
    "왼쪽부터 실, 직선 대바늘, 줄바늘, 양끝바늘, 코바늘. 생김새가 다른 만큼 잘하는 일도 다릅니다."
  ),
  "things-to-knit": hero(
    "things-to-knit-hero.jpg",
    "린넨 위에 접어 둔 세이지 그린 스웨터, 뜨개 가방, 비니와 장갑",
    "옷, 가방, 모자. 바늘 위의 코가 쌓이면 입고 메고 쓰는 것이 됩니다."
  ),
};

const GUIDE_SECTION_FIGURES: Record<string, Record<string, GuideFigureData>> = {
  "knitting-slang": {
    "스타시, 얀치킨, 얀바프 — 실을 둘러싼 말들": inline(
      "knitting-slang-yarn-chicken.jpg",
      "거의 다 뜬 크림색 편물과 옆에 남은 작은 실뭉치",
      "몸판이 거의 끝났는데 실이 주먹만 하게 남으면, 그게 얀치킨입니다. 이기면 완성, 지면 배색입니다."
    ),
  },
  "gauge-swatch": {
    "재는 방법과 숫자를 기록하는 습관": inline(
      "gauge-swatch-measure.jpg",
      "스와치 안쪽에 핀과 자를 대고 10센티미터 구간을 재는 모습",
      "가장자리에서 2cm 이상 들어간 지점을 잽니다. 한 곳이 아니라 두세 군데를 재 평균 내는 편이 안전합니다."
    ),
  },
  "read-yarn-label": {
    "라벨을 잃어버린 뒤에 할 수 있는 일": inline(
      "read-yarn-label-keep.jpg",
      "남은 실과 종이 라벨을 지퍼백에 넣고 저울 옆에 둔 모습",
      "쓰기 시작한 타래도 라벨과 같이 넣으세요. 사진을 재고에 붙이면 상자를 다 비우지 않아도 됩니다."
    ),
  },
  "project-journal": {
    "한 줄로도 충분한 일지 예시": inline(
      "project-journal-note.jpg",
      "코 표시 마커가 꽂힌 진행 중 작품과 옆에 둔 연필·수첩",
      "위치, 변경, 실 상태만 있으면 다음 세션을 열 수 있습니다. 감상보다 숫자가 다시 집을 때 도움이 됩니다."
    ),
  },
  "yarn-stash-reset": {
    "한 번에 끝내지 않는 4단계": inline(
      "yarn-stash-reset-sort.jpg",
      "새 타래, 시작된 실, 잔실, 선물 실로 나눠 놓은 네 더미",
      "꺼내기, 상태 분류, 숫자 기록, 다음 작품 연결. 처음부터 색상 정렬까지 할 필요는 없습니다."
    ),
  },
  "pattern-pdf-care": {
    "파일 이름만 바꿔도 찾는 시간이 줄어듭니다": inline(
      "pattern-pdf-care-files.jpg",
      "노트북과 출력 도안, 실이 정리된 보관 책상",
      "디자이너명과 작품명을 파일명에 넣는 규칙만 유지해도 검색이 쉬워집니다."
    ),
  },
  "beginner-kit": {
    "첫 주말에 하면 좋은 작은 연습": inline(
      "beginner-kit-square.jpg",
      "대바늘 옆에 놓인 작은 연습용 뜨개 네모",
      "본작품 전에 10cm 네모를 떠 보면 코와 단을 세는 리듬을 같이 익힐 수 있습니다."
    ),
  },
  "blocking-finish": {
    "물 블로킹의 기본 순서": inline(
      "blocking-finish-pins.jpg",
      "블로킹 매트 가장자리를 따라 핀으로 고정한 뜨개천",
      "직선이 필요한 가장자리만 고정해도 됩니다. 완전히 마를 때까지 옮기지 마세요."
    ),
  },
  "choose-needles": {
    "소재와 형태는 손의 피로를 바꿉니다": inline(
      "choose-needles-materials.jpg",
      "대나무 대바늘과 금속 대바늘을 실과 함께 비교해 둔 모습",
      "나무는 덜 미끄럽고, 금속은 빠릅니다. 한 작품을 끝낸 뒤 불편했던 지점만 바꾸면 됩니다."
    ),
  },
  "needle-types": {
    "직선 대바늘과 줄바늘, 넓게 뜨거나 둥글게": inline(
      "needle-types-circular.jpg",
      "줄바늘에 걸린 세이지 그린 원통 뜨개와 옆에 둔 실타래",
      "줄바늘은 두 끝과 줄만으로 목도리도, 모자도 뜹니다. 코는 줄에 쉬고, 손은 끝만 움직이면 됩니다."
    ),
    "양끝바늘은 작은 텐트를 칩니다": inline(
      "needle-types-dpn.jpg",
      "양끝바늘 네 개에 나눠 걸린 작은 세이지 그린 뜨개",
      "양끝바늘은 짧은 막대 여럿이 코를 나눠 듭니다. 빈 바늘로 다음 면을 뜨면 작은 원통이 됩니다."
    ),
    "코바늘은 한 손으로 집을 짓습니다": inline(
      "needle-types-crochet.jpg",
      "나무 코바늘과 세이지 그린 그래니 스퀘어, 옆에 둔 실타래",
      "코바늘은 갈고리 하나로 코를 걸어 올립니다. 완성된 코는 바늘이 아니라 천에 남습니다."
    ),
  },
  "things-to-knit": {
    "옷 — 내가 뜬 것을 입는 일": inline(
      "things-to-knit-clothes.jpg",
      "접어 둔 세이지 그린 손뜨개 스웨터와 나무 대바늘",
      "직접 뜬 스웨터를 입는 일은, 내가 센 단이 팔에 앉는 일입니다."
    ),
    "가방 — 손에 들고 어깨에 메는 일": inline(
      "things-to-knit-bag.jpg",
      "세이지 그린 코바늘 토트백 안에 크림색 실타래가 담긴 모습",
      "다음에 뜰 실을 담는 가방도, 한때는 실이었습니다."
    ),
    "악세서리와 작은 쓰임 — 매일 손이 가는 온기": inline(
      "things-to-knit-accessories.jpg",
      "세이지 그린 비니와 크림색 넥워머, 옆에 둔 실과 바늘",
      "모자와 넥워머는 몸에서 가장 가까운 악세서리입니다. 끝나는 속도가 빨라, 다음 날부터 쓸 수 있습니다."
    ),
  },
};

/**
 * 가이드 히어로 그림을 반환한다.
 */
export const getGuideHeroFigure = (slug: string) => {
  return GUIDE_HEROES[slug] ?? null;
};

/**
 * 해당 절에 붙는 본문 그림을 반환한다.
 */
export const getGuideSectionFigure = (slug: string, heading: string) => {
  return GUIDE_SECTION_FIGURES[slug]?.[heading] ?? null;
};
