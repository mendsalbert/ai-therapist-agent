import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Security | Data Protection | Hope",
  description: "Learn about Hope's commitment to privacy and security. Industry-leading data protection, encrypted storage, transparent privacy practices, and user control over personal information.",
  keywords: ["privacy policy", "data security", "mental health privacy", "data protection", "user privacy", "secure therapy", "encrypted data"],
  openGraph: {
    title: "Privacy & Security | Data Protection at Hope",
    description: "Learn about Hope's commitment to privacy and security with industry-leading data protection and transparent privacy practices.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/privacy-security",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy & Security | Data Protection",
    description: "Discover Hope's commitment to privacy and security with industry-leading data protection.",
  },
};

export default function PrivacySecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
