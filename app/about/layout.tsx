import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Hope | Our Mission, Vision & Values | AI Mental Health App",
  description: "Learn about Hope - our mission to make mental health support accessible, our vision for compassionate AI therapy, and our values of warmth, privacy, and simplicity. Discover how Hope combines AI journaling, guided meditation, and community support.",
  keywords: ["about hope", "mental health mission", "AI therapy values", "mental wellness vision", "hope app about", "mental health app mission"],
  openGraph: {
    title: "About Hope | Our Mission & Vision for Mental Wellness",
    description: "Discover Hope's mission to make mental health support accessible, warm, and practical. Learn about our vision for compassionate AI therapy and community care.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Hope | Mission, Vision & Values",
    description: "Learn about Hope's commitment to accessible, warm mental health support through AI therapy, journaling, and community.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
