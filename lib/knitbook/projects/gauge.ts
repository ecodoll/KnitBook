/**
 * 게이지 컬럼이 없는 DB와 호환하기 위한 메모 사이드카 인코딩을 다룬다.
 * 화면에 보이지 않는 마커를 notes 끝에 붙였다가, 읽을 때 다시 꺼낸다.
 */
const GAUGE_SIDECAR_RE = /\n?<!--kb-gauge:([^,]*),([^>]*)-->\s*$/;

type GaugeSidecar = {
  notes: string | null;
  gaugeStitches: number | null;
  gaugeRows: number | null;
};

/**
 * 사이드카 문자열을 숫자 또는 null로 바꾼다.
 */
const parseSidecarNumber = (raw: string) => {
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * 메모에서 게이지 사이드카를 분리한다.
 */
const parseGaugeSidecar = (notes: string | null | undefined): GaugeSidecar => {
  if (!notes) {
    return { notes: notes ?? null, gaugeStitches: null, gaugeRows: null };
  }

  const match = notes.match(GAUGE_SIDECAR_RE);
  if (!match) {
    return { notes, gaugeStitches: null, gaugeRows: null };
  }

  const cleaned = notes.replace(GAUGE_SIDECAR_RE, "").replace(/\s+$/, "");
  return {
    notes: cleaned === "" ? null : cleaned,
    gaugeStitches: parseSidecarNumber(match[1] ?? ""),
    gaugeRows: parseSidecarNumber(match[2] ?? ""),
  };
};

/**
 * 게이지 값을 메모 사이드카로 붙인다. 값이 없으면 마커를 넣지 않는다.
 */
const attachGaugeSidecar = (
  notes: string | null,
  gaugeStitches: unknown,
  gaugeRows: unknown
) => {
  const cleaned = parseGaugeSidecar(notes).notes;
  const stitchPart = gaugeStitches == null ? "" : String(gaugeStitches);
  const rowPart = gaugeRows == null ? "" : String(gaugeRows);

  if (!stitchPart && !rowPart) {
    return cleaned;
  }

  const marker = `<!--kb-gauge:${stitchPart},${rowPart}-->`;
  return cleaned ? `${cleaned}\n${marker}` : marker;
};

/**
 * 게이지 컬럼 없이 저장할 payload를 만든다.
 * 게이지 값이 있으면 메모 사이드카로 옮겨 다른 필드와 함께 저장한다.
 */
const applyGaugeWriteFallback = (payload: Record<string, unknown>) => {
  const next = { ...payload };
  delete next.gauge_stitches;
  delete next.gauge_rows;

  if (payload.gauge_stitches != null || payload.gauge_rows != null) {
    next.notes = attachGaugeSidecar(
      typeof payload.notes === "string" ? payload.notes : null,
      payload.gauge_stitches,
      payload.gauge_rows
    );
  }

  return next;
};

export { applyGaugeWriteFallback, attachGaugeSidecar, parseGaugeSidecar };
