import getConfig from "@/lib/api/data/users/getConfig";
import getAccount from "@/lib/api/data/users/getAccount";
import ProfilePageClient from "./ProfileClient";

export default async function ProfilePage() {
  const [account, config] = await Promise.all([getAccount(), getConfig()]);
  if (!account) return null;
  if (!config) return null;
  return (
    <ProfilePageClient
      user={{
        ...account,
        blacklisted: false,
        blacklisted_at: null,
        blacklisted_by: null,
        blacklisted_reason: null,
      }}
      config={config}
    />
  );
}
