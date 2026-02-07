"use client"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/meter/DashboardHeader"
import { SessionList } from "@/components/meter/SessionList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const [balance, setBalance] = useState<string>("0.00")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchWalletData = async () => {
            if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()
                    const userAddress = await signer.getAddress()
                    const userBalance = await provider.getBalance(userAddress)
                    
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
        <div className="min-h-screen bg-background">
            <DashboardHeader />
            <main className="container mx-auto px-4 sm:px-6 max-w-5xl">
                <div className="grid gap-6 mb-8 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="text-2xl font-bold">$342.50</div>
                            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground mt-1">1 session ending soon</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
                        </CardHeader>
                         <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <div className="text-2xl font-bold">{Number(balance).toFixed(4)} ETH</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Wallet Connected</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Recent Sessions</h2>
                    <SessionList />
                </div>
            </main>
        </div>
    )
}
