import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Status | Hope",
  description:
    "View payment status for your Hope subscription, including success and failure confirmations.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Hope Payment Status",
    description:
      "Check whether your Hope subscription payment succeeded or requires attention.",
    url: "https://hopementalhealthsupport.xyz/payment",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hope Payment Status",
    description:
      "Review the status of your Hope subscription payment.",
  },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
