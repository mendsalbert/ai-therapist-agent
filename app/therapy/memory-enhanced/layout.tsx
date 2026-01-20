import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Therapy with Memory | Personalized Sessions | Hope",
  description:
    "Chat with Hope's memory-enhanced AI therapist. Personalized, empathetic conversations that remember your context, track progress, and support your mental wellness journey.",
  keywords: [
    "AI therapy with memory",
    "personalized AI therapist",
    "context-aware therapy",
    "mental health chat",
    "memory enhanced conversations",
  ],
  openGraph: {
    title: "Memory-Enhanced AI Therapy | Hope",
    description:
      "Have context-aware, supportive therapy chats with Hope's memory-enhanced AI. Stay consistent, track progress, and feel heard.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/therapy/memory-enhanced",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory-Enhanced AI Therapy | Hope",
    description:
      "Get personalized, context-aware AI therapy sessions with Hope's memory-enhanced companion.",
  },
};

export default function MemoryEnhancedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
