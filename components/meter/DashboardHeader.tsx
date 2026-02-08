"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { ethers } from "ethers"

export function DashboardHeader() {
    const [balance, setBalance] = useState<string>("0.00")
    const [address, setAddress] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchWalletData = async () => {
            if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const userAddress = await signer.getAddress()
                    const userBalance = await provider.getBalance(userAddress)

                    setAddress(userAddress)
                    setBalance(ethers.formatEther(userBalance))
                } catch (error) {
                    console.error("Failed to fetch wallet data:", error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }

        fetchWalletData()
    }, [])

    return (
        <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 mb-8">
            <div className="flex font-bold items-center gap-2 text-xl tracking-tight">
                <div className="h-6 w-6 rounded-full bg-primary" />
                Meter
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 text-sm text-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <span>
                            {Number(balance).toFixed(4)} ETH
                            {address && <span className="text-muted-foreground ml-2">({address.slice(0, 6)}...{address.slice(-4)})</span>}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
