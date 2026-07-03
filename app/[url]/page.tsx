import { getProfile } from "@/lib/api/data/profiles/getProfile";
import ProfilePageProvider from "@/components/profile/PageProvider";
import EntryScreen from "@/components/profile/EntryScreen";
import ProfileContent from "@/components/profile/ProfileContent";
import Overlay from "@/components/profile/overlay";
import { TrackView } from "@/components/profile/TrackView";
import { headers } from "next/headers";
import NotFound from "./not-found";
import type { Metadata } from "next";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatMetadataText(template: string, username: string, description: string): string {
  return template
    .replace(/{username}/g, username)
    .replace(/{description}/g, description);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url: string }>;
}): Promise<Metadata> {
  const { url } = await params;
  const profile = await getProfile({ url });
  if (!profile) return {};

  const username = profile.username;
  const rawDescription = profile.config.description ? stripHtml(profile.config.description) : "";

  // Set default formats
  let title = username;
  let description = rawDescription;

  // If premium and configured, apply custom text logic
  if (profile.premium) {
    if (profile.config.meta_title) {
      title = formatMetadataText(profile.config.meta_title, username, rawDescription);
    }
    if (profile.config.meta_description) {
      description = formatMetadataText(profile.config.meta_description, username, rawDescription);
    }
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "jury.lat";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const ogImageUrl = `${baseUrl}/api/og/${url}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${baseUrl}/${url}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${username}'s profile image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const profile = await getProfile({ url });
  if (!profile) {
    return <NotFound url={url} />;
  }
  // temp because im too lazy to add it to track view >.<
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
  return (
    <ProfilePageProvider
      background={profile.config.backgrounds[0] ?? null}
      config={profile.config}
    >
      <TrackView userId={profile.id} device={device} />
      <Overlay config={profile.config} />
      <EntryScreen showEnterscreen={true} config={profile.config} />
      <ProfileContent config={profile.config} user={profile} />
    </ProfilePageProvider>
  );
}
