import { redirect } from "next/navigation";
import { getActiveAppUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getActiveAppUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (!isAdmin(user)) {
    redirect("/");
  }
  return <>{children}</>;
}
