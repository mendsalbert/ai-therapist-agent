import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | AI Therapist, Journaling, Meditations & More | Hope",
  description: "Explore Hope's powerful features: AI therapist with conversation memory, private journaling with AI insights, mood tracking, guided meditations, CBT tools, community support, and weekly wellness reports. Premium features for unlimited access.",
  keywords: ["hope features", "AI therapist", "mental health journaling", "guided meditations", "mood tracking", "CBT tools", "community support", "wellness reports"],
  openGraph: {
    title: "Hope Features | AI Therapy, Journaling & Mental Wellness Tools",
    description: "Discover Hope's comprehensive mental health features: AI therapy, journaling, meditations, mood tracking, CBT tools, and community support.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope Features | AI Therapy & Mental Wellness Tools",
    description: "Explore Hope's features: AI therapist, journaling, meditations, mood tracking, CBT tools, and community support.",
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
