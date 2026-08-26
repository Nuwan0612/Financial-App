import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FutureJournal } from "./types"
import { fmtUSD } from "./helpers"

export function FutureJournalDialog({
  open, date, onClose, onSaved,
}: {
  open: boolean
  date: string
  onClose: () => void
  onSaved: (journal: FutureJournal) => void
}) {
  const [form, setForm] = useState({
    pair: "BTC/USDT",
    direction: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    exitPrice: "",
    size: "",
    notes: "",
  })

  const profit = form.entryPrice && form.exitPrice && form.size
    ? form.direction === "LONG"
      ? (Number(form.exitPrice) - Number(form.entryPrice)) * Number(form.size)
      : (Number(form.entryPrice) - Number(form.exitPrice)) * Number(form.size)
    : null

  const handleSave = () => {
    if (!form.pair || !form.entryPrice || !form.exitPrice || !form.size) return
    onSaved({
      id: Date.now(),
      date,
      pair: form.pair,
      direction: form.direction,
      entryPrice: Number(form.entryPrice),
      exitPrice: Number(form.exitPrice),
      size: Number(form.size),
      profit: profit ?? 0,
      notes: form.notes,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Journal Trade — {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Pair</Label>
              <Input placeholder="e.g. BTC/USDT" value={form.pair}
                onChange={e => setForm(p => ({ ...p, pair: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 w-28">
              <Label className="text-xs">Direction</Label>
              <Select value={form.direction} onValueChange={v => setForm(p => ({ ...p, direction: v as any }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG">LONG</SelectItem>
                  <SelectItem value="SHORT">SHORT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Entry Price ($)</Label>
              <Input type="number" placeholder="0" value={form.entryPrice}
                onChange={e => setForm(p => ({ ...p, entryPrice: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Exit Price ($)</Label>
              <Input type="number" placeholder="0" value={form.exitPrice}
                onChange={e => setForm(p => ({ ...p, exitPrice: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Size</Label>
              <Input type="number" placeholder="0" value={form.size}
                onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          {profit !== null && (
            <div className={`rounded-lg p-3 text-center font-semibold text-sm
              ${profit >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-destructive"}`}>
              Estimated P&L: {profit >= 0 ? "+" : ""}{fmtUSD(profit)}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What was your reason for the trade? How did it go?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Journal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  spotBalance: number
  futureBalance: number
  direction: "spot-to-future" | "future-to-spot"
}

export function TransferDialog({
  open,
  onClose,
  spotBalance,
  futureBalance,
  direction,
}: TransferDialogProps) {

  const isSpotToFuture = direction === "spot-to-future"

  const availableBalance = isSpotToFuture
    ? spotBalance
    : futureBalance

  const fromAccount = isSpotToFuture ? "Spot" : "Futures"
  const toAccount = isSpotToFuture ? "Futures" : "Spot"

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="sm:max-w-sm">

        <DialogHeader>
          <DialogTitle>
            Transfer {fromAccount} → {toAccount}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          <div className="rounded-lg bg-muted/30 px-3 py-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Available in {fromAccount}
              </span>

              <span className="font-medium">
                {fmtUSD(availableBalance)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              placeholder="0.00"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Funds will be moved from your {fromAccount} wallet to your{" "}
            {toAccount} account.
          </p>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={onClose}>
            Transfer
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}




import { useEffect,useMemo } from "react"
import { Loader2, Search } from "lucide-react"
import { cryptoApi, SpotTradeDto } from "@/lib/api/binance"


interface SpotTradeDialogProps {
  open: boolean
  accountId: number
  bucketId: number
  spotBalance: number
  onClose: () => void
  onSuccess: () => void
}

export function SpotTradeDialog({
  open,
  accountId,
  bucketId,
  spotBalance,
  onClose,
  onSuccess,
}: SpotTradeDialogProps) {
  const [allCoins, setAllCoins] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  
  const [type, setType] = useState<"BUY" | "SELL">("BUY")
  const [investAmount, setInvestAmount] = useState<string>("") // Kept as string for the input field
  
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [fetchingCoins, setFetchingCoins] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all available coins on open
  useEffect(() => {
    if (!open) return
    setFetchingCoins(true)
    fetch("/api/binance/crypto-search") // Replace with standard API client if you have one
      .then(r => r.json())
      .then(data => setAllCoins(data))
      .catch(() => console.error("Failed to fetch coins"))
      .finally(() => setFetchingCoins(false))
  }, [open])

  // Fetch price when a coin is selected
  useEffect(() => {
    if (!selectedCoin) return
    setFetchingPrice(true)
    setCurrentPrice(null)
    fetch(`/api/binance/crypto-prices?symbols=${selectedCoin}`)
      .then(r => r.json())
      .then(data => setCurrentPrice(data[selectedCoin] ?? null))
      .catch(() => setCurrentPrice(null))
      .finally(() => setFetchingPrice(false))
  }, [selectedCoin])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("")
      setSelectedCoin(null)
      setCurrentPrice(null)
      setInvestAmount("")
      setError(null)
      setType("BUY")
    }
  }, [open])

  const filteredCoins = useMemo(() =>
    search.length >= 1
      ? allCoins.filter(c => c.toLowerCase().startsWith(search.toLowerCase())).slice(0, 20)
      : [],
    [search, allCoins]
  )

  // Quantity the user will receive or sell
  const quantity = useMemo(() => {
    const amountNum = Number(investAmount)
    if (!currentPrice || !investAmount || isNaN(amountNum) || amountNum <= 0) return null
    return amountNum / currentPrice
  }, [currentPrice, investAmount])

  const validate = (): string | null => {
    if (!selectedCoin) return "Please select a coin."
    if (!currentPrice) return "Price not loaded yet."
    
    const amountNum = Number(investAmount)
    if (!investAmount || isNaN(amountNum) || amountNum <= 0) {
      return "Please enter a valid amount."
    }
    
    if (type === "BUY" && amountNum > spotBalance) {
      return `Insufficient buying power. Available: ${fmtUSD(spotBalance)}`
    }
    
    // Note: SELL validation for sufficient coin quantity is handled by your Spring Boot backend. 
    // It will throw an error which is caught in the handleSubmit catch block below.
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) { 
      setError(validationError)
      return 
    }

    try {
      setLoading(true)
      setError(null)

      const dto: SpotTradeDto = {
        accountId,
        bucketId,
        coin: selectedCoin!,
        type,
        quantity: quantity!,
        executionPrice: currentPrice!,
        amount: Number(investAmount), // FIXED: Explicitly cast the string to a Number for the backend
      }

      await cryptoApi.executeTrade(dto)
      onSuccess()
      onClose()
    } catch (err: any) {
      // Safely extract the backend error message (e.g., "Insufficient Coin quantity to sell.")
      const backendMessage = err?.response?.data?.message || err?.response?.data || "Trade failed. Please try again."
      setError(typeof backendMessage === 'string' ? backendMessage : "Trade failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Execute Spot Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* BUY / SELL toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["BUY", "SELL"] as const).map(t => (
              <button key={t} onClick={() => { setType(t); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold transition-colors
                  ${type === t
                    ? t === "BUY" ? "bg-green-600 text-white" : "bg-destructive text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Coin search */}
          <div className="space-y-1.5">
            <Label className="text-xs">Coin</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search symbol e.g. BTC, ETH..."
                value={selectedCoin ?? search}
                onChange={e => { setSearch(e.target.value); setSelectedCoin(null); setCurrentPrice(null) }}
                className="pl-9 h-9"
              />
            </div>

            {/* Dropdown results */}
            {search && !selectedCoin && (
              <div className="rounded-lg border border-border bg-background shadow-md max-h-40 overflow-y-auto">
                {fetchingCoins ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredCoins.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No coins found.</p>
                ) : filteredCoins.map(coin => (
                  <button key={coin}
                    onClick={() => { setSelectedCoin(coin); setSearch(coin) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                    {coin}
                    <span className="text-xs text-muted-foreground ml-2">{coin}/USDT</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current price */}
          {selectedCoin && (
            <div className="rounded-lg bg-muted/30 px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Price ({selectedCoin}/USDT)</span>
              {fetchingPrice ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : currentPrice ? (
                <span className="text-sm font-semibold">{fmtUSD(currentPrice)}</span>
              ) : (
                <span className="text-xs text-destructive">Failed to load price</span>
              )}
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Amount to {type === "BUY" ? "Spend" : "Receive"} (USDT)</Label>
              {type === "BUY" && (
                <button
                  onClick={() => { setInvestAmount(String(spotBalance)); setError(null) }}
                  className="text-[10px] text-primary hover:underline">
                  Max: {fmtUSD(spotBalance)}
                </button>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={investAmount}
              onChange={e => { setInvestAmount(e.target.value); setError(null) }}
              className="h-9"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Quantity preview */}
          {quantity !== null && currentPrice && selectedCoin && (
            <div className="rounded-lg border border-border px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">You will {type === "BUY" ? "receive" : "sell"}</span>
                <span className="font-semibold">
                  {quantity.toFixed(8)} {selectedCoin}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">At price</span>
                <span className="text-muted-foreground">{fmtUSD(currentPrice)}/coin</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border pt-1.5">
                <span className="text-muted-foreground">Total Value (USDT)</span>
                <span className="font-semibold">{fmtUSD(Number(investAmount))}</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedCoin || !currentPrice || !investAmount}
            className={type === "SELL" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {type === "BUY" ? "Buy" : "Sell"} {selectedCoin ?? "Coin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}