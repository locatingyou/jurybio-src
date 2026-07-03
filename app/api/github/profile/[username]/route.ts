import { NextRequest, NextResponse } from "next/server";
import { handleServerErrors } from "@/lib/error";

interface GitHubProfile {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  company: string;
  location: string;
  email: string;
  website: string;
  avatarUrl: string;
  profileUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  created: string;
  updated: string;
}

async function scrape(username: string): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "jury.lat",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      id: d.id,
      username: d.login,
      displayName: d.name ?? d.login,
      bio: d.bio ?? "",
      company: d.company ?? "",
      location: d.location ?? "",
      email: d.email ?? "",
      website: d.blog ?? "",
      avatarUrl: d.avatar_url,
      profileUrl: d.html_url,
      followers: d.followers,
      following: d.following,
      publicRepos: d.public_repos,
      publicGists: d.public_gists,
      created: d.created_at,
      updated: d.updated_at,
    };
  } catch {
    return null;
  }
}

async function fetchFromDrain(username: string): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`https://drain.lat/api/v1/github/profile/${username}`, {
      headers: { "x-api-key": process.env.DRAIN_API_KEY! },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const data = (await scrape(username)) ?? (await fetchFromDrain(username));
    if (!data) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
