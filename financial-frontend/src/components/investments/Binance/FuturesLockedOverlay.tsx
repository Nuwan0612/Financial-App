import { Zap, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FuturesLockedOverlayProps {
  onUnlock: () => void
  compact?: boolean
}

export function FuturesLockedOverlay({ onUnlock, compact = false }: FuturesLockedOverlayProps) {
  if (compact) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[1px] gap-2 p-2 z-10">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          <p className="text-xs font-medium">No Futures</p>
        </div>
        <Button 
          onClick={onUnlock} 
          size="sm" 
          variant="secondary" 
          className="h-7 text-[11px] px-3 font-medium border border-border shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Create Account
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/10 z-10">
      <div className="rounded-2xl border border-border bg-background/95 shadow-lg px-8 py-6 text-center space-y-4 backdrop-blur-md">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Zap className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-semibold">No Futures Account</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-[240px] mx-auto">
            Create a futures account to start trading contracts and journaling your trades.
          </p>
        </div>
        <Button onClick={onUnlock} className="gap-2 w-full">
          <Plus className="h-4 w-4" />
          Create Futures Account
        </Button>
      </div>
    </div>
  )
}