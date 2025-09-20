"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Target, 
  Palette,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects/create", icon: FolderKanban },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Art", href: "/art", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-800 text-white rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 
            w-64 bg-slate-900/70 p-6 flex flex-col justify-between
            transform transition-transform duration-200 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 mt-12 lg:mt-0">
              <LayoutDashboard className="text-primary text-3xl" />
              <h1 className="text-white text-xl font-bold">LifeOS</h1>
            </div>

            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
                      ${isActive 
                        ? "bg-primary text-white" 
                        : "text-gray-300 hover:bg-accent hover:text-gray-100"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="bg-accent p-4 rounded-lg text-center">
            <p className="text-sm text-gray-300">
              &ldquo;The only way to do great work is to love what you do.&rdquo;
            </p>
            <p className="text-xs text-gray-500 mt-2">- Steve Jobs</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
