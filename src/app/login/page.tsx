import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginContent } from "@/components/auth/login-content";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/");
  }

  return <LoginContent />;
}
