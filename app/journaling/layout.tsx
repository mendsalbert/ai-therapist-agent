import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Journaling | Private Journal with AI Insights | Hope",
  description: "Start journaling with Hope's AI-powered journal. Write freely, get AI insights, track your mood, and use CBT thought records. Premium features include detailed analysis, emotional state tracking, and weekly summaries.",
  keywords: ["AI journaling", "mental health journal", "journaling app", "mood tracking", "CBT journaling", "thought records", "emotional journaling"],
  openGraph: {
    title: "AI Journaling | Private Journal with AI Insights",
    description: "Write freely in Hope's AI-powered journal. Get insights, track your mood, and use CBT thought records. Premium features include detailed analysis and weekly summaries.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/journaling",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Journaling | Private Journal with AI Insights",
    description: "Start journaling with Hope's AI-powered journal. Get insights, track your mood, and use CBT thought records.",
  },
};

export default function JournalingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
