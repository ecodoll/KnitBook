import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticleView from "@/components/site/GuideArticleView";
import { getGuideHeroFigure } from "@/lib/knitbook/guide-images";
import { getAllGuides, getGuideBySlug } from "@/lib/knitbook/guides";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";

type GuideDetailPageProps = PageProps<"/guides/[slug]">;

/** 사이트맵에 있는 가이드만 열고, 없는 슬러그는 바로 404로 보낸다. */
export const dynamicParams = false;

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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const hero = getGuideHeroFigure(guide.slug);

  return withPublicCanonical(`/guides/${guide.slug}`, {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      ...(hero
        ? {
            images: [
              {
                url: hero.src,
                width: hero.width,
                height: hero.height,
                alt: hero.alt,
              },
            ],
          }
        : {}),
    },
  });
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
