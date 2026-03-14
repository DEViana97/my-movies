import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RegisterContent } from "@/components/auth/register-content";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/");
  }

  return <RegisterContent />;
}