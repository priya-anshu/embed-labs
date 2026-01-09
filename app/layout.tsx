import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata = {
  title: "EmbedLabs",
  description: "Learn embedded systems the practical way",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
  <Providers>
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </Providers>
</body>
    </html>
  );
}
