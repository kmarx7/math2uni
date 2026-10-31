import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "Math 90 · 한 개념 더 단단하게",
  description:
    "수학의 기초부터 차근차근. 개념, 실험, 연습과 복습을 연결하는 자기주도 학습 플랫폼.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <ProgressProvider>
          <Shell>{children}</Shell>
        </ProgressProvider>
      </body>
    </html>
  );
}
