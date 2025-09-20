import type { Metadata } from "next"; 
import "./globals.css"; 
import Navbar from "@/components/Navbar" 




export const metadata: Metadata = { 
  title: "LifeOS", 
  description: "Personal Project Management system and Goal tracker", };



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-[var(--secondary-color)] flex bg-slate-950 text-gray-100">
                  <Navbar />
                  <main className="flex-1 p-4">{children}</main>
                </div>
      </body>
    </html>
  );
}
