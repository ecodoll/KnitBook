import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticleView from "@/components/site/GuideArticleView";
import { getAllGuides, getGuideBySlug } from "@/lib/knitbook/guides";

type GuideDetailPageProps = PageProps<"/guides/[slug]">;

/**
 * 가이드 상세 경로를 미리 만든다.
 */
export const generateStaticParams = () => {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
};

/**
 * 가이드 글의 검색용 제목과 설명을 만든다.
 */
export const generateMetadata = async ({
  params,
}: GuideDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "가이드를 찾을 수 없어요",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
  };
};

/**
 * 공개 가이드 원문 페이지다.
 */
const GuideDetailPage = async ({ params }: GuideDetailPageProps) => {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return <GuideArticleView guide={guide} />;
};

export default GuideDetailPage;
