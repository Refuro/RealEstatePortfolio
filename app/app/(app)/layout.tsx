import { getAppUser } from "@/lib/auth";
import { AppLayoutClient } from "./app-layout-client";
import { RestoreAccountScreen } from "./restore-account-screen";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (user?.deletedAt) {
    return <RestoreAccountScreen />;
  }
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
