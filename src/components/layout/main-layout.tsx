
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package2,
  BarChart3,
  ListOrdered,
  Menu,
  PieChart
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Resumo", icon: BarChart3 },
    { href: "/orders", label: "Pedidos", icon: ListOrdered },
    { href: "/reports", label: "Relatórios", icon: PieChart },
  ];

  const NavLinkElements = ({ isMobile = false }) => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const link = (
          <Link
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-accent text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );

        return isMobile ? <SheetClose asChild key={href}>{link}</SheetClose> : <div key={href}>{link}</div>;
      })}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Mypet pedidos</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavLinkElements />
          </div>
        </div>
      </div>

      {/* Mobile Header & Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Package2 className="h-6 w-6" />
                  <span className="">Mypet pedidos</span>
                </Link>
              </div>
              <div className="flex-1 py-4">
                <NavLinkElements isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 text-center">
            <Link href="/" className="text-lg font-semibold">
              Mypet Pedidos
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
