import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

const usageData = [
    { action: "Generate Image (512x512)", count: 45, costPer: 0.05, total: 2.25 },
    { action: "Upscale 2x", count: 12, costPer: 0.10, total: 1.20 },
    { action: "Remove Background", count: 8, costPer: 0.02, total: 0.16 },
]

export function SessionUsage() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Cost / Unit</TableHead>
                    <TableHead className="text-right">Total (USDC)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {usageData.map((item, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{item.action}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">${item.costPer.toFixed(3)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
