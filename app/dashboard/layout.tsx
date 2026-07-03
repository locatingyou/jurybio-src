import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import getAccount from "@/lib/api/data/users/getAccount";
import { UserProvider } from "./_user-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccount();
  if (!account) return null;
  return (
    <UserProvider initialUser={account}>
      <SidebarProvider className="h-dvh lg:overflow-y-hidden">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex min-h-0 flex-col">
          <SiteHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
