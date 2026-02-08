"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/meter/DashboardHeader"
import { SessionList } from "@/components/meter/SessionList"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"
import { Loader2, Sparkles, MessageSquare, Image, Code, PlayCircle, StopCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ActiveSession {
    sessionId: string;
    appSessionId: string;
    startTime: number;
    usageCount: number;
    totalCost: number;
}

export default function DashboardPage() {
    const { toast } = useToast()
    const [address, setAddress] = useState<string | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
    const [isStartingSession, setIsStartingSession] = useState(false)
    const [isEndingSession, setIsEndingSession] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const connectWallet = async () => {
        try {
            if (!(window as any).ethereum) {
                toast({
                    title: "MetaMask not found",
                    description: "Please install MetaMask to continue",
                    variant: "destructive",
                })
                return
            }

            setIsConnecting(true)
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const signer = await provider.getSigner()
            const userAddress = await signer.getAddress()

            setAddress(userAddress)
            toast({
                title: "Wallet Connected",
                description: `Connected to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
            })
        } catch (error: any) {
            console.error("Failed to connect wallet:", error)
            toast({
                title: "Connection Failed",
                description: error.message || "Failed to connect wallet",
                variant: "destructive",
            })
        } finally {
            setIsConnecting(false)
        }
    }

    const startSession = async () => {
        if (!address) return

        setIsStartingSession(true)
        try {
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: address }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start session')
            }

            setActiveSession({
                sessionId: data.sessionId,
                appSessionId: data.appSessionId,
                startTime: data.startTime,
                usageCount: 0,
                totalCost: 0,
            })

            toast({
                title: "Session Started",
                description: `Session ID: ${data.sessionId.slice(0, 12)}...`,
            })
        } catch (error: any) {
            console.error("Failed to start session:", error)
            toast({
                title: "Session Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsStartingSession(false)
        }
    }

    const endSession = async () => {
        if (!activeSession) return

        setIsEndingSession(true)
        try {
            const response = await fetch('/api/session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: activeSession.sessionId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to end session')
            }

            toast({
                title: "Session Ended",
                description: `Settled ${activeSession.usageCount} uses for $${activeSession.totalCost.toFixed(4)}`,
            })

            setActiveSession(null)
        } catch (error: any) {
            console.error("Failed to end session:", error)
            toast({
                title: "Session Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsEndingSession(false)
        }
    }

    const useAIFeature = async (featureName: string, cost: number = 0.001) => {
        if (!activeSession) return

        setIsProcessing(true)
        try {
            const response = await fetch('/api/session/increment-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: activeSession.sessionId,
                    cost,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to increment usage')
            }

            setActiveSession(prev => prev ? {
                ...prev,
                usageCount: data.usageCount,
                totalCost: data.totalCost,
            } : null)

            toast({
                title: `${featureName} Used`,
                description: `Cost: $${cost.toFixed(4)} • Total: $${data.totalCost.toFixed(4)}`,
            })
        } catch (error: any) {
            console.error("Failed to use feature:", error)
            toast({
                title: "Feature Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                address={address}
                onConnectWallet={connectWallet}
                isConnecting={isConnecting}
            />
            <main className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {!address ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-bold">Welcome to Meter</h2>
                            <p className="text-muted-foreground max-w-md">
                                Connect your wallet to start a payment session and use AI features
                            </p>
                        </div>
                        <Button onClick={connectWallet} disabled={isConnecting} size="lg">
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect Wallet'
                            )}
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Session Control */}
                        <div className="mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Session</CardTitle>
                                    <CardDescription>
                                        {activeSession ? 'Session is active. Use AI features below.' : 'Start a session to begin using AI features'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {activeSession ? (
                                        <>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Usage Count</div>
                                                    <div className="text-2xl font-bold">{activeSession.usageCount}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Total Cost</div>
                                                    <div className="text-2xl font-bold">${activeSession.totalCost.toFixed(4)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Duration</div>
                                                    <div className="text-2xl font-bold">
                                                        {Math.floor((Date.now() - activeSession.startTime) / 1000)}s
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={endSession}
                                                disabled={isEndingSession}
                                                variant="destructive"
                                                className="w-full gap-2"
                                            >
                                                {isEndingSession ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Ending Session...
                                                    </>
                                                ) : (
                                                    <>
                                                        <StopCircle className="h-4 w-4" />
                                                        End Session & Settle
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={startSession}
                                            disabled={isStartingSession}
                                            className="w-full gap-2"
                                        >
                                            {isStartingSession ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Starting Session...
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="h-4 w-4" />
                                                    Start Session
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Features */}
                        {activeSession && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold tracking-tight mb-4">AI Features</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => useAIFeature('Text Generation', 0.001)}>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Sparkles className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Text Generation</div>
                                                <div className="text-sm text-muted-foreground">$0.0010 per use</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => useAIFeature('Chat Completion', 0.0015)}>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Chat Completion</div>
                                                <div className="text-sm text-muted-foreground">$0.0015 per use</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => useAIFeature('Image Generation', 0.003)}>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Image className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Image Generation</div>
                                                <div className="text-sm text-muted-foreground">$0.0030 per use</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => useAIFeature('Code Assistant', 0.002)}>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Code className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Code Assistant</div>
                                                <div className="text-sm text-muted-foreground">$0.0020 per use</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                {isProcessing && (
                                    <div className="mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recent Sessions */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold tracking-tight">Recent Sessions</h2>
                            <SessionList />
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
