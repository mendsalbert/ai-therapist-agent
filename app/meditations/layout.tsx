import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guided Meditations | Mindfulness & Stress Relief | Hope",
  description: "Access Hope's library of guided meditations for stress relief, mindfulness, sleep, and emotional wellness. Free and premium meditation sessions available. Track your progress and build a consistent practice.",
  keywords: ["guided meditations", "mindfulness meditation", "stress relief", "sleep meditation", "anxiety meditation", "meditation library", "mental wellness meditation"],
  openGraph: {
    title: "Guided Meditations | Mindfulness & Stress Relief",
    description: "Explore Hope's library of guided meditations for stress relief, mindfulness, sleep, and emotional wellness. Free and premium sessions available.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/meditations",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guided Meditations | Mindfulness & Stress Relief",
    description: "Access guided meditations for stress relief, mindfulness, sleep, and emotional wellness.",
  },
};

export default function MeditationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
