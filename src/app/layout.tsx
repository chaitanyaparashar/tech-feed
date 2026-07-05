import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Product Buzz Feed",
  description: "A ranked feed of AI product launches and news buzz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
