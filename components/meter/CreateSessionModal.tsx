"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function CreateSessionModal({ children }: { children: ReactNode }) {
  const [spendLimit, setSpendLimit] = useState([50])
  const [open, setOpen] = useState(false)

  const handleCreate = () => {
    // Simulate creation
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Session</DialogTitle>
          <DialogDescription>
            Create a spending session for your external application.
            Funds are locked until settlement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="app">Application</Label>
            <Select>
                <SelectTrigger id="app">
                    <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gen-ai">Image Generator API</SelectItem>
                    <SelectItem value="llm">LLM Inference Worker</SelectItem>
                    <SelectItem value="scraper">Data Scraper</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="limit">Spending Limit (USDC)</Label>
                <span className="text-sm font-medium text-muted-foreground">${spendLimit}</span>
            </div>
            <Slider
                id="limit"
                min={1}
                max={500}
                step={1}
                value={spendLimit}
                onValueChange={setSpendLimit}
                className="py-4"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chain">Settlement Network</Label>
            <Select defaultValue="base">
                <SelectTrigger id="chain">
                    <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="base">Base (Fastest)</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
