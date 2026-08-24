import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSync from "@/components/knitbook/auth/AuthSync";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KnitBook",
  description:
    "도안·작품·실을 한곳에서 관리하는 나만의 뜨개 비서 KnitBook입니다.",
};

/**
 * 앱 전역 레이아웃(폰트·토스트·인증 동기화)을 구성한다.
 */
const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Toaster>
          <AuthSync />
          {children}
        </Toaster>
      </body>
    </html>
  );
};

export default RootLayout;
