import { redirect } from "next/navigation";
import { fakeAuth } from "@/lib/fakeAuth";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!fakeAuth.isLoggedIn) {
    redirect("/login");
  }

  return <>{children}</>;
}
