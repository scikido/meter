import { DashboardHeader } from "@/components/meter/DashboardHeader"
import { SessionList } from "@/components/meter/SessionList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
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
                            <div className="text-2xl font-bold">$1,250.00</div>
                            <p className="text-xs text-muted-foreground mt-1">Auto-reload enabled</p>
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
