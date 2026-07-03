import getAccount from "@/lib/api/data/users/getAccount";
import DashboardClientPage from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const data = await getAccount();
  if (!data) {
    redirect("/");
  }
  return (
    <DashboardClientPage
      uid={data.uid}
      username={data.username}
      is_avatar_uploaded={!!data.config?.avatar_url}
      is_description_added={!!data.config?.description?.trim()}
      is_account_connected={!!data.connections?.id}
      is_links_added={!!data.links?.id}
      claimed_badge_ids={data.claimed_badge_ids}
    />
  );
}
