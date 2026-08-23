import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/knitbook/layout/AppShell";
import NewPatternScreen from "@/app/patterns/new/NewPatternScreen";
import { getAppHeaderUser } from "@/lib/knitbook/app-user";

export const metadata: Metadata = {
  title: "도안 올리기 | KnitBook",
  description: "PDF 도안을 업로드하는 KnitBook 페이지입니다.",
};

/**
 * 도안 업로드 페이지이다.
 */
const NewPatternPage = async () => {
  const user = await getAppHeaderUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <NewPatternScreen />
    </AppShell>
  );
};

export default NewPatternPage;
