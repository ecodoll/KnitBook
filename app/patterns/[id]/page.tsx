import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/knitbook/layout/AppShell";
import PatternDetailScreen from "@/app/patterns/[id]/PatternDetailScreen";
import { getPatternDetailPageData } from "@/lib/knitbook/pattern-data";

type PatternDetailPageProps = PageProps<"/patterns/[id]">;

export const generateMetadata = async ({
  params,
}: PatternDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const data = await getPatternDetailPageData(id);
    if (!data) {
      return { title: "도안 | KnitBook" };
    }

    return {
      title: `${data.pattern.title} | KnitBook`,
      description: `${data.pattern.title} 도안을 보는 KnitBook 페이지입니다.`,
    };
  } catch {
    return { title: "도안 | KnitBook" };
  }
};

/**
 * 도안 상세(뷰어) 페이지이다.
 */
const PatternDetailPage = async ({ params }: PatternDetailPageProps) => {
  const { id } = await params;

  let data;
  try {
    data = await getPatternDetailPageData(id);
  } catch {
    redirect("/login");
  }

  if (!data) {
    notFound();
  }

  return (
    <AppShell user={data.user} showBottomNav={false} className="px-0 pt-2">
      <div className="px-4">
        <PatternDetailScreen initialPattern={data.pattern} />
      </div>
    </AppShell>
  );
};

export default PatternDetailPage;
