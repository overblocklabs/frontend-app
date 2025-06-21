import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Lotellar | Decentralized Lottery Platform",
  description: "Join ongoing lotteries and compete for amazing prizes. All results are transparent and verifiable on the blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={'antialiased bg-black'}
      >
        {children}
      </body>
    </html>
  );
}
