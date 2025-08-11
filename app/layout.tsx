import "./globals.css";

export const metadata = {
  title: "ALTITUDE",
  description: "ALTITUDE: post‑apocalyptic sky world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}