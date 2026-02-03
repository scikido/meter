import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground mb-6">
        v1.0 Public Beta
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6 max-w-2xl">
        Pay per use. <br className="hidden sm:inline" />
        <span className="text-primary">Settle once.</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
        Meter abstracts blockchain complexity into a simple session-based payment layer.
        Spin up a session, stream payments for API calls, and settle automatically in USDC.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/dashboard">
            Create Session <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
          <Link href="#">
            View Documentation
          </Link>
        </Button>
      </div>
    </div>
  )
}
