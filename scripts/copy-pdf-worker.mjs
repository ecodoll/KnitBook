/**
 * pdfjs-dist 워커를 public에 복사해 Next.js가 정적 파일로 제공하게 한다.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pdfjsDir = dirname(require.resolve("pdfjs-dist/package.json"));
const source = join(pdfjsDir, "build", "pdf.worker.min.mjs");
const destDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

mkdirSync(destDir, { recursive: true });
copyFileSync(source, join(destDir, "pdf.worker.min.mjs"));
console.log("copied pdf.worker.min.mjs → public/");
