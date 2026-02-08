import { SessionUsage } from "@/components/meter/SessionUsage"
import { SessionTimeline } from "@/components/meter/SessionTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="min-h-screen bg-background">
            {/* Simple Header */}
            <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 mb-8">
                <Link href="/" className="flex font-bold items-center gap-2 text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="h-6 w-6 rounded-full bg-emerald-500" />
                    Meter
                </Link>
            </div>
            <main className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight">Image Generator API</h1>
                            <Badge>Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Session ID: {id || "sess_01"}</p>
                    </div>
                    <Button variant="destructive">End Session</Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Spend / Limit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$12.50 <span className="text-muted-foreground text-lg font-normal">/ $50.00</span></div>
                            <div className="h-2 w-full bg-secondary rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary w-[25%]" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,240</div>
                            <p className="text-xs text-muted-foreground mt-1">Avg 450ms latency</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Expires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24h 12m</div>
                            <p className="text-xs text-muted-foreground mt-1">Auto-renew disabled</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="usage">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="usage">Usage Breakdown</TabsTrigger>
                        <TabsTrigger value="logs">Event Log</TabsTrigger>
                    </TabsList>
                    <TabsContent value="usage" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage By Action</CardTitle>
                                <CardDescription>Itemized billing for this session.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SessionUsage />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Events</CardTitle>
                                <CardDescription>Audit trail of session activity.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SessionTimeline />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
