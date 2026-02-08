import Hero from "@/components/meter/Hero";
import { FlowFeatures } from "@/components/meter/FlowFeatures";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex bg-transparent font-bold items-center gap-2 text-xl tracking-tight">
            <div className="h-6 w-6 rounded-full bg-emerald-500" />
            Meter
          </div>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <FlowFeatures />
      </main>

      <footer className="py-6 md:py-8 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 text-sm text-balance text-center text-muted-foreground">
          <p>&copy; 2024 Meter Protocol. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
