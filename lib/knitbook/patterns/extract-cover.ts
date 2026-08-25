/**
 * 도안 PDF 첫 페이지에서 표지 JPEG을 추출한다.
 */
import {
  AnnotationMode,
  getDocument,
  GlobalWorkerOptions,
  ImageKind,
  OPS,
  type PDFDocumentProxy,
  type PDFPageProxy,
} from "pdfjs-dist";

/** 표지 JPEG 긴 변 최대 픽셀 */
const MAX_COVER_EDGE = 720;

/** 표지 JPEG 품질 */
const COVER_JPEG_QUALITY = 0.84;

/** 아이콘·장식으로 볼 최소 변 길이 */
const MIN_IMAGE_EDGE = 72;

/** 장식용 띠 이미지로 볼 가로세로 비율 */
const MAX_STRIP_ASPECT = 6;

type PdfImageLike = {
  width?: number;
  height?: number;
  kind?: number;
  data?: ArrayBufferView | null;
  bitmap?: CanvasImageSource | null;
};

let workerConfigured = false;

/**
 * pdf.js 워커 경로를 한 번만 설정한다.
 */
const configurePdfWorker = () => {
  if (workerConfigured || typeof window === "undefined") {
    return;
  }

  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
};

/**
 * 캔버스를 JPEG Blob으로 변환한다.
 */
const canvasToJpegBlob = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("표지 이미지를 만들지 못했어요."));
      },
      "image/jpeg",
      COVER_JPEG_QUALITY
    );
  });
};

/**
 * 긴 변이 maxEdge를 넘으면 비율을 유지한 채 축소한다.
 */
const downscaleCanvas = (source: HTMLCanvasElement, maxEdge: number) => {
  const longest = Math.max(source.width, source.height);
  if (longest <= maxEdge) {
    return source;
  }

  const scale = maxEdge / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    return source;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * 사진처럼 보이는지 판단하기 위해 밝기 분산을 계산한다.
 */
const sampleLumaVariance = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return 0;
  }

  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const step = Math.max(1, Math.floor(Math.min(width, height) / 48));
  let count = 0;
  let sum = 0;
  let sumSquares = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const luma =
        0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
      sum += luma;
      sumSquares += luma * luma;
      count += 1;
    }
  }

  if (count === 0) {
    return 0;
  }

  const mean = sum / count;
  return sumSquares / count - mean * mean;
};

/**
 * 지정한 사각형을 캔버스에서 잘라 낸다.
 */
const cropCanvas = (
  canvas: HTMLCanvasElement,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) => {
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  if (cropWidth < 40 || cropHeight < 40) {
    return canvas;
  }

  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  const croppedContext = cropped.getContext("2d");
  if (!croppedContext) {
    return canvas;
  }

  croppedContext.drawImage(
    canvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
  return cropped;
};

/**
 * 픽셀이 흰 여백이 아닌지 확인한다.
 */
const isInkPixel = (data: Uint8ClampedArray, index: number) => {
  if (data[index + 3] < 16) {
    return false;
  }
  return data[index] < 248 || data[index + 1] < 248 || data[index + 2] < 248;
};

/**
 * 첫 페이지에서 가장 큰 그림 덩어리를 잘라 표지로 쓴다.
 */
const cropLargestImageRegion = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return canvas;
  }

  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const cell = Math.max(4, Math.floor(Math.min(width, height) / 90));
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const grid = new Uint8Array(cols * rows);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = Math.min(width - 1, col * cell + Math.floor(cell / 2));
      const y = Math.min(height - 1, row * cell + Math.floor(cell / 2));
      if (isInkPixel(data, (y * width + x) * 4)) {
        grid[row * cols + col] = 1;
      }
    }
  }

  const seen = new Uint8Array(cols * rows);
  let bestCount = 0;
  let bestMinX = 0;
  let bestMinY = 0;
  let bestMaxX = 0;
  let bestMaxY = 0;

  for (let start = 0; start < grid.length; start += 1) {
    if (!grid[start] || seen[start]) {
      continue;
    }

    let count = 0;
    let minCol = cols;
    let minRow = rows;
    let maxCol = 0;
    let maxRow = 0;
    const queue = [start];
    seen[start] = 1;

    while (queue.length > 0) {
      const index = queue.pop() as number;
      const col = index % cols;
      const row = Math.floor(index / cols);
      count += 1;
      if (col < minCol) minCol = col;
      if (row < minRow) minRow = row;
      if (col > maxCol) maxCol = col;
      if (row > maxRow) maxRow = row;

      const neighbors = [
        index - 1,
        index + 1,
        index - cols,
        index + cols,
      ];
      for (const next of neighbors) {
        if (next < 0 || next >= grid.length || seen[next] || !grid[next]) {
          continue;
        }
        const nextCol = next % cols;
        if (Math.abs(nextCol - col) + Math.abs(Math.floor(next / cols) - row) !== 1) {
          continue;
        }
        seen[next] = 1;
        queue.push(next);
      }
    }

    if (count > bestCount) {
      bestCount = count;
      bestMinX = minCol * cell;
      bestMinY = minRow * cell;
      bestMaxX = Math.min(width - 1, (maxCol + 1) * cell - 1);
      bestMaxY = Math.min(height - 1, (maxRow + 1) * cell - 1);
    }
  }

  if (bestCount === 0) {
    return canvas;
  }

  const pad = Math.round(Math.min(width, height) * 0.02);
  const minX = Math.max(0, bestMinX - pad);
  const minY = Math.max(0, bestMinY - pad);
  const maxX = Math.min(width - 1, bestMaxX + pad);
  const maxY = Math.min(height - 1, bestMaxY + pad);
  const area = (maxX - minX + 1) * (maxY - minY + 1);

  if (area < width * height * 0.08) {
    return canvas;
  }

  return cropCanvas(canvas, minX, minY, maxX, maxY);
};

/**
 * RGB 픽셀 버퍼를 RGBA ImageData로 채운다.
 */
const fillRgbAsRgba = (
  target: Uint8ClampedArray,
  source: ArrayBufferView,
  pixelCount: number
) => {
  const bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  for (let pixel = 0, src = 0, dst = 0; pixel < pixelCount; pixel += 1) {
    target[dst] = bytes[src];
    target[dst + 1] = bytes[src + 1];
    target[dst + 2] = bytes[src + 2];
    target[dst + 3] = 255;
    src += 3;
    dst += 4;
  }
};

/**
 * pdf.js 이미지 객체를 캔버스로 그린다.
 */
const pdfImageToCanvas = async (image: PdfImageLike) => {
  const width = image.width ?? 0;
  const height = image.height ?? 0;
  if (width < 2 || height < 2) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0, width, height);
    return canvas;
  }

  if (!image.data) {
    return null;
  }

  const imageData = context.createImageData(width, height);
  const pixelCount = width * height;
  const kind = image.kind;
  const byteLength = image.data.byteLength;

  if (kind === ImageKind.RGBA_32BPP || byteLength === pixelCount * 4) {
    imageData.data.set(
      new Uint8ClampedArray(
        image.data.buffer,
        image.data.byteOffset,
        pixelCount * 4
      )
    );
  } else if (kind === ImageKind.RGB_24BPP || byteLength === pixelCount * 3) {
    fillRgbAsRgba(imageData.data, image.data, pixelCount);
  } else {
    return null;
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
};

/**
 * 페이지 객체 저장소에서 이미지 이름을 꺼낸다.
 */
const getPageObject = (page: PDFPageProxy, name: string) => {
  if (page.objs.has(name)) {
    return (page.objs.get(name) as PdfImageLike | null) ?? null;
  }
  if (page.commonObjs.has(name)) {
    return (page.commonObjs.get(name) as PdfImageLike | null) ?? null;
  }
  return null;
};

/**
 * 추출 이미지가 표지로 적당한지 점수를 매긴다. 낮을수록 부적합하다.
 */
const scoreCoverCandidate = (
  canvas: HTMLCanvasElement,
  pageWidth: number,
  pageHeight: number
) => {
  const { width, height } = canvas;
  const minEdge = Math.min(width, height);
  const maxEdge = Math.max(width, height);
  if (minEdge < MIN_IMAGE_EDGE) {
    return -1;
  }

  const aspect = maxEdge / minEdge;
  if (aspect > MAX_STRIP_ASPECT) {
    return -1;
  }

  const variance = sampleLumaVariance(canvas);
  if (variance < 40) {
    return -1;
  }

  const pageArea = Math.max(pageWidth * pageHeight, 1);
  const coverage = (width * height) / pageArea;
  return width * height + variance * 80 + (coverage > 0.04 ? 80_000 : 0);
};

/**
 * 첫 페이지에 심어진 래스터 이미지 중 가장 적당한 것을 고른다.
 */
const extractEmbeddedCover = async (
  page: PDFPageProxy,
  pageWidth: number,
  pageHeight: number
) => {
  const operatorList = await page.getOperatorList({
    annotationMode: AnnotationMode.DISABLE,
  });

  const imageOps = new Set([
    OPS.paintImageXObject,
    OPS.paintInlineImageXObject,
    OPS.paintImageXObjectRepeat,
  ]);

  const seen = new Set<string>();
  let bestCanvas: HTMLCanvasElement | null = null;
  let bestScore = 0;

  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    const fn = operatorList.fnArray[index];
    if (!imageOps.has(fn)) {
      continue;
    }

    const args = operatorList.argsArray[index] as unknown[];
    const firstArg = args?.[0];
    let image: PdfImageLike | null = null;

    if (typeof firstArg === "string") {
      if (seen.has(firstArg)) {
        continue;
      }
      seen.add(firstArg);
      image = getPageObject(page, firstArg);
    } else if (firstArg && typeof firstArg === "object") {
      image = firstArg as PdfImageLike;
    }

    if (!image) {
      continue;
    }

    const canvas = await pdfImageToCanvas(image);
    if (!canvas) {
      continue;
    }

    const score = scoreCoverCandidate(canvas, pageWidth, pageHeight);
    if (score > bestScore) {
      bestScore = score;
      bestCanvas = canvas;
    }
  }

  return bestCanvas;
};

/**
 * 첫 페이지 전체를 그려 표지 후보를 만든다.
 */
const renderPageCover = async (page: PDFPageProxy) => {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2, MAX_COVER_EDGE / Math.max(baseViewport.width, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvas,
    viewport,
    annotationMode: AnnotationMode.DISABLE,
  }).promise;

  return cropLargestImageRegion(canvas);
};

/**
 * PDF 원본을 연다.
 */
const openPdfDocument = async (source: File | string) => {
  configurePdfWorker();

  if (typeof source === "string") {
    return getDocument({
      url: source,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      withCredentials: false,
    }).promise;
  }

  const buffer = await source.arrayBuffer();
  return getDocument({
    data: new Uint8Array(buffer),
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
    withCredentials: false,
  }).promise;
};

/**
 * 업로드한 도안 PDF 첫 페이지에서 표지 JPEG을 추출한다.
 */
const extractPatternCoverFromPdf = async (source: File | string) => {
  if (typeof window === "undefined") {
    return null;
  }

  let pdf: PDFDocumentProxy | null = null;

  try {
    pdf = await openPdfDocument(source);
    if (pdf.numPages < 1) {
      return null;
    }

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const embedded = await extractEmbeddedCover(
      page,
      viewport.width,
      viewport.height
    );
    const coverCanvas = embedded ?? (await renderPageCover(page));
    if (!coverCanvas) {
      return null;
    }

    return canvasToJpegBlob(downscaleCanvas(coverCanvas, MAX_COVER_EDGE));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 표지 추출 실패]", error);
    }
    return null;
  } finally {
    await pdf?.destroy().catch(() => undefined);
  }
};

export { extractPatternCoverFromPdf };
