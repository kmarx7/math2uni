import { requireAccount } from "@/modules/auth/server";
import { ProgressProvider } from "@/components/progress-provider";
import { Shell } from "@/components/shell";
export default async function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireAccount();
  return (
    <ProgressProvider account={account}>
      <Shell>{children}</Shell>
    </ProgressProvider>
  );
}
