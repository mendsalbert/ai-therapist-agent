import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peer Matching | Find Supportive Matches | Hope",
  description:
    "Find supportive peers for mental health journeys with Hope's AI-powered matching, safety checks, and guided chat spaces.",
  keywords: [
    "peer matching",
    "mental health matching",
    "support partner",
    "Hope community matching",
    "mental health chat partner",
  ],
  openGraph: {
    title: "Hope Peer Matching",
    description:
      "Connect with supportive peers using AI-powered matching, safety checks, and guided chat spaces.",
    url: "https://hopementalhealthsupport.xyz/matching",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope Peer Matching",
    description:
      "Find a supportive match for safe, moderated mental health conversations with Hope.",
  },
};

export default function MatchingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
