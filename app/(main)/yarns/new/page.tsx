import type { Metadata } from "next";
import NewYarnScreen from "@/app/(main)/yarns/new/NewYarnScreen";

export const metadata: Metadata = {
  title: "실 등록 | KnitBook",
  description: "보유한 실을 재고에 등록하는 KnitBook 페이지입니다.",
};

/**
 * 실 등록 페이지이다.
 */
const NewYarnPage = () => {
  return <NewYarnScreen />;
};

export default NewYarnPage;
