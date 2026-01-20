import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Free & Premium Plans | Hope Mental Health App",
  description: "Choose your Hope plan: Free plan with 150 AI messages/month, basic journaling, and 10 meditations. Premium plan with unlimited messages, AI insights, weekly reports, and full access. Start your 7-day free trial today.",
  keywords: ["hope pricing", "mental health app pricing", "AI therapy cost", "premium subscription", "free trial", "hope premium", "mental wellness subscription"],
  openGraph: {
    title: "Hope Pricing | Free & Premium Plans",
    description: "Start with Hope Free or upgrade to Premium for unlimited AI therapy, journaling insights, and weekly wellness reports. 7-day free trial available.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope Pricing | Free & Premium Plans",
    description: "Free plan available or upgrade to Premium for unlimited access. Start your 7-day free trial today.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
