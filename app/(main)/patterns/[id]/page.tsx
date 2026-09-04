import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import PatternDetailScreen from "@/app/(main)/patterns/[id]/PatternDetailScreen";
import LoadingState from "@/components/knitbook/shared/LoadingState";
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
 * 도안 상세 본문을 불러와 렌더한다.
 */
const PatternDetailLoader = async ({ id }: { id: string }) => {
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
    <div className="-mx-4 -mt-2 px-4 pt-2">
      <PatternDetailScreen key={data.pattern.id} initialPattern={data.pattern} />
    </div>
  );
};

/**
 * 도안 상세(뷰어) 페이지이다.
 */
const PatternDetailPage = async ({ params }: PatternDetailPageProps) => {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <PatternDetailLoader id={id} />
    </Suspense>
  );
};

export default PatternDetailPage;
