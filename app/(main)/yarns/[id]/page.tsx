import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import YarnDetailScreen from "@/app/(main)/yarns/[id]/YarnDetailScreen";
import { getYarnDetailPageData } from "@/lib/knitbook/yarn-data";

type YarnDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: YarnDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const data = await getYarnDetailPageData(id);
    if (!data) {
      return { title: "실 | KnitBook" };
    }

    return {
      title: `${data.yarn.brand} · ${data.yarn.productName} | KnitBook`,
      description: `${data.yarn.brand} ${data.yarn.productName} 실 재고를 보는 KnitBook 페이지입니다.`,
    };
  } catch {
    return { title: "실 | KnitBook" };
  }
};

/**
 * 실 상세 페이지이다.
 */
const YarnDetailPage = async ({ params }: YarnDetailPageProps) => {
  const { id } = await params;

  let data;
  try {
    data = await getYarnDetailPageData(id);
  } catch {
    redirect("/login");
  }

  if (!data) {
    notFound();
  }

  return <YarnDetailScreen key={data.yarn.id} initialYarn={data.yarn} />;
};

export default YarnDetailPage;
