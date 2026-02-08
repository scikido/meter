'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Pay for AI as You Use It
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Meter enables micropayment sessions for AI services using Yellow Network's state channels.
            Start a session, use AI features, and settle only what you consume.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="relative p-8 rounded-2xl border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 mb-4">
              <Zap className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Start payment sessions in seconds using state channels. No blockchain delays.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 mb-4">
              <Shield className="h-6 w-6 text-teal-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Trustless</h3>
            <p className="text-sm text-muted-foreground">
              Multi-party signatures ensure secure settlement without intermediaries.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
              <TrendingUp className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pay Per Use</h3>
            <p className="text-sm text-muted-foreground">
              Only pay for what you actually use. Track usage in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
