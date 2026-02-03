import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Zap, Server, CheckCircle2 } from "lucide-react"

export function FlowFeatures() {
  return (
    <div className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">1. Create Session</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Define a spending limit and generate a session key. No wallet connection required for your users.
                        </p>
                    </div>
                </div>

                 {/* Step 2 */}
                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                        <Server className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">2. Use App</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Pass the key with every API request. Meter tracks usage and validates limits in real-time.
                        </p>
                    </div>
                </div>

                 {/* Step 3 */}
                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">3. Auto-Settlement</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            When the session ends, funds are settled on-chain in USDC. You get paid instantly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
