import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Supportive Mental Health Community | Hope",
  description: "Join Hope's supportive mental health community. Share experiences, connect with others, and find encouragement in safe, moderated spaces. Post anonymously when you need extra privacy.",
  keywords: ["mental health community", "support community", "mental wellness forum", "peer support", "mental health spaces", "community support"],
  openGraph: {
    title: "Community | Supportive Mental Health Community",
    description: "Join Hope's supportive mental health community. Share experiences, connect with others, and find encouragement in safe, moderated spaces.",
    type: "website",
    url: "https://hopementalhealthsupport.xyz/community",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community | Supportive Mental Health Community",
    description: "Join Hope's supportive community. Share experiences, connect with others, and find encouragement.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
