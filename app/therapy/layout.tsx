import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Therapy Sessions | Chat with AI Therapist | Hope",
  description: "Chat with Hope's AI therapist. Get supportive, empathetic conversations with personalized responses. Memory-enhanced AI that learns your communication style. Start a new therapy session anytime.",
  keywords: ["AI therapy", "AI therapist", "chat therapy", "online therapy", "AI mental health", "therapy sessions", "conversational AI", "mental health chat"],
  openGraph: {
    title: "AI Therapy Sessions | Chat with AI Therapist",
    description: "Chat with Hope's AI therapist for supportive, empathetic conversations. Memory-enhanced AI that learns your communication style.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/therapy",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Therapy Sessions | Chat with AI Therapist",
    description: "Start chatting with Hope's AI therapist for supportive, empathetic conversations anytime.",
  },
};

export default function TherapyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
