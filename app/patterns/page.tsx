import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/knitbook/layout/AppShell";
import PatternsScreen from "@/app/patterns/PatternsScreen";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";

export const metadata: Metadata = {
  title: "도안 | KnitBook",
  description: "PDF 도안을 업로드하고 목록에서 관리하는 KnitBook 도안 페이지입니다.",
};

/**
 * 도안 목록 페이지이다.
 */
const PatternsPage = async () => {
  let data;
  try {
    data = await getPatternsPageData();
  } catch {
    redirect("/login");
  }

  if (!data) {
    redirect("/login");
  }

  return (
    <AppShell user={data.user}>
      <PatternsScreen initialPatterns={data.patterns} />
    </AppShell>
  );
};

export default PatternsPage;
