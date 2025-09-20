import type { Metadata } from "next"; 
import { Geist, Geist_Mono } from "next/font/google"; 
import "./globals.css"; 
import Navbar from "@/components/Navbar" 


const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"], }); 

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"], }); 


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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-[var(--secondary-color)] flex bg-slate-950 text-gray-100">
                  <Navbar />
                  <main className="flex-1 p-4">{children}</main>
                </div>
      </body>
    </html>
  );
}
