import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile & Preferences | Hope",
  description:
    "Manage your Hope profile, communication preferences, goals, subscription, and wellness data.",
  keywords: [
    "Hope profile",
    "account settings",
    "mental health preferences",
    "subscription management",
    "wellness data",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Hope Profile & Settings",
    description:
      "Update your Hope profile, preferences, and subscription details.",
    url: "https://hopementalhealthsupport.xyz/profile",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hope Profile & Settings",
    description:
      "Manage your Hope account details, preferences, and subscription.",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
