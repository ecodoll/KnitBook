import type { Metadata } from "next";
import NewPatternScreen from "@/app/(main)/patterns/new/NewPatternScreen";

export const metadata: Metadata = {
  title: "도안 올리기 | KnitBook",
  description: "PDF 도안을 업로드하는 KnitBook 페이지입니다.",
};

/**
 * 도안 업로드 페이지이다.
 */
const NewPatternPage = () => {
  return <NewPatternScreen />;
};

export default NewPatternPage;
