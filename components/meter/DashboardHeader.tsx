"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
    address: string | null;
    onConnectWallet: () => void;
    isConnecting: boolean;
}

export function DashboardHeader({ address, onConnectWallet, isConnecting }: DashboardHeaderProps) {
    return (
        <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 mb-8">
            <Link href="/" className="flex font-bold items-center gap-2 text-xl tracking-tight hover:opacity-80 transition-opacity">
                <div className="h-6 w-6 rounded-full bg-primary" />
                Meter
            </Link>
            <div className="flex items-center gap-6">
                {address ? (
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span>
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    </div>
                ) : (
                    <Button onClick={onConnectWallet} disabled={isConnecting} className="gap-2">
                        <Wallet className="h-4 w-4" />
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                )}
            </div>
        </div>
    )
}
