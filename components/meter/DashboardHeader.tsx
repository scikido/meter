import { Button } from "@/components/ui/button"
import { CreateSessionModal } from "./CreateSessionModal"
import { Wallet } from "lucide-react"

export function DashboardHeader() {
    return (
        <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 mb-8">
             <div className="flex font-bold items-center gap-2 text-xl tracking-tight">
                <div className="h-6 w-6 rounded-full bg-primary" />
                Meter
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 text-sm text-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                     <Wallet className="h-4 w-4 text-muted-foreground" />
                     <span>1,250.00 USDC</span>
                </div>
                <CreateSessionModal>
                    <Button>New Session</Button>
                </CreateSessionModal>
            </div>
        </div>
    )
}
