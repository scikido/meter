"use client"

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const sessions = [
    {
        id: "sess_01",
        app: "Image Generator API",
        status: "active",
        spend: 12.50,
        limit: 50.00,
        usage: 25
    },
    {
        id: "sess_02",
        app: "LLM Inference Worker",
        status: "active",
        spend: 45.20,
        limit: 100.00,
        usage: 45
    },
    {
        id: "sess_03",
        app: "Data Scraper",
        status: "completed",
        spend: 8.00,
        limit: 20.00,
        usage: 40
    },
    {
        id: "sess_04",
        app: "Legacy Integration",
        status: "completed",
        spend: 50.00,
        limit: 50.00,
        usage: 100
    }
]

export function SessionList() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">App Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Spend (USDC)</TableHead>
                        <TableHead className="w-[200px]">Usage</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => (
                        <TableRow key={session.id}>
                            <TableCell className="font-medium">{session.app}</TableCell>
                            <TableCell>
                                <Badge variant={session.status === "active" ? "default" : "secondary"}>
                                    {session.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(session.spend)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={session.usage} className="h-2 w-[60%]" />
                                    <span className="text-xs text-muted-foreground">{session.usage}%</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/session/${session.id}`}>
                                        View <ArrowRight className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
