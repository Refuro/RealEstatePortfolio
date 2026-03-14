import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    subscriptionTier: user.subscriptionTier,
  });
}
