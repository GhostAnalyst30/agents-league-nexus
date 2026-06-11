import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={session.user.name || "User"}
        userEmail={session.user.email || ""}
        userRole={session.user.role}
      />
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  );
}
