import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CBT Dashboard | Cognitive Behavioral Tools | Hope",
  description:
    "Access Hope's CBT dashboard for thought records, mood tracking, and progress insights to support your mental health practice.",
  keywords: [
    "CBT dashboard",
    "cognitive behavioral therapy tools",
    "thought records",
    "mood tracking",
    "mental health analytics",
  ],
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Hope CBT Dashboard",
    description:
      "Track thought records, moods, and progress with Hope's CBT toolkit.",
    url: "https://hopementalhealthsupport.xyz/cbt",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hope CBT Dashboard",
    description:
      "Use Hope's CBT tools for thought records, mood tracking, and progress insights.",
  },
};

export default function CbtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
