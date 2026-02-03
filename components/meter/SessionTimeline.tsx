

const events = [
    { time: "2 mins ago", event: "Usage limit warning (80%)" },
    { time: "1 hour ago", event: "Session validated" },
    { time: "1 hour ago", event: "Session created via API" },
]

export function SessionTimeline() {
    return (
        <div className="space-y-4">
            {events.map((e, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-l-2 border-muted pl-4 ml-2 last:pb-0">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <p className="text-sm font-medium">{e.event}</p>
                        <p className="text-xs text-muted-foreground">{e.time}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
