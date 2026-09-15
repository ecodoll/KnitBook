import type { Metadata } from "next";
import LoginWorkspace from "@/components/site/LoginWorkspace";
import { getGuideBySlug, getGuidesGrouped } from "@/lib/knitbook/guides";

type LoginPageProps = {
  searchParams: Promise<{
    reset?: string | string[];
    guide?: string | string[];
  }>;
};

/**
 * 쿼리에서 첫 번째 문자열 값을 꺼낸다.
 */
const getSingleParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

/**
 * 재설정 실패 쿼리가 있는지 판별한다.
 */
const hasResetFailed = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.includes("failed");
  }

  return value === "failed";
};

/**
 * 로그인 화면에 열 가이드 슬러그를 고른다.
 */
const getInitialGuideSlug = (value: string | string[] | undefined) => {
  const slug = getSingleParam(value);
  if (!slug) {
    return null;
  }

  return getGuideBySlug(slug)?.slug ?? null;
};

export const generateMetadata = async ({
  searchParams,
}: LoginPageProps): Promise<Metadata> => {
  const params = await searchParams;
  const guideSlug = getInitialGuideSlug(params.guide);
  const guide = guideSlug ? getGuideBySlug(guideSlug) : null;

  if (guide) {
    return {
      title: guide.title,
      description: guide.description,
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: "로그인",
    description:
      "KnitBook에 로그인하고 도안·작품·실 재고를 한곳에서 관리하세요.",
    robots: {
      index: false,
      follow: true,
    },
  };
};

/**
 * 이메일 로그인과 공개 가이드를 함께 보여주는 첫 화면이다.
 */
const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams;

  return (
    <LoginWorkspace
      groups={getGuidesGrouped()}
      initialSlug={getInitialGuideSlug(params.guide)}
      resetFailed={hasResetFailed(params.reset)}
    />
  );
};

export default LoginPage;
