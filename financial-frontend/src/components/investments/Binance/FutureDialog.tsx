import { useRef, useState } from "react"
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
import { AccountTransfer, FutureJournal } from "./types"
import { fmtUSD } from "./helpers"

// ─── Screenshot Upload Helper ─────────────────────────────────
async function uploadScreenshot(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload-screenshot', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error('Upload failed')
  return data.path
}


export function FutureJournalDialog({
  open, 
  date, 
  accountId, 
  bucketId, 
  onClose, 
  onSaved,
}: {
  open: boolean
  date: string
  accountId: number
  bucketId: number
  onClose: () => void
  onSaved: (journal: FutureJournal) => void
}) {
  const [form, setForm] = useState({
    coinPair: "BTC/USDT",
    positionType: "LONG" as "LONG" | "SHORT",
    leverage: 10,
    margin: "",
    pnl: "",
    openDate: `${date}T09:00`,
    closeDate: `${date}T10:00`,
    notes: "",
  })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setForm({
        coinPair: "BTC/USDT",
        positionType: "LONG",
        leverage: 10,
        margin: "",
        pnl: "",
        openDate: `${date}T09:00`,
        closeDate: `${date}T10:00`,
        notes: "",
      })
      setScreenshot(null)
      setScreenshotPreview(null)
      setError(null)
    }
  }, [open, date])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  const validate = (): string | null => {
    if (!form.coinPair.trim()) return "Coin pair is required."
    if (!form.margin || Number(form.margin) <= 0) return "Margin must be greater than 0."
    if (!form.pnl) return "PnL is required."
    if (!form.openDate) return "Open date is required."
    if (!form.closeDate) return "Close date is required."
    if (new Date(form.closeDate) < new Date(form.openDate)) return "Close date must be after open date."
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    try {
      setLoading(true)
      setError(null)

      let ssPath = ""
      if (screenshot) {
        ssPath = await uploadScreenshot(screenshot)
      }

      const dto: FutureJournalRequestDto = {
        accountId,
        bucketId,
        coinPair: form.coinPair,
        positionType: form.positionType,
        leverage: form.leverage,
        margin: Number(form.margin),
        pnl: Number(form.pnl),
        openDate: new Date(form.openDate).toISOString(),
        closeDate: new Date(form.closeDate).toISOString(),
        ss_path: ssPath,
        notes: form.notes,
      }

      const res = await cryptoApi.createFutureJournal(dto)

      onSaved({
        id: res.data.id,
        coinPair: res.data.coinPair,
        positionType: res.data.positionType,
        leverage: res.data.leverage,
        margin: res.data.margin,
        realizedPnl: res.data.realizedPnl,
        openDate: new Date(res.data.openDate),
        closeDate: new Date(res.data.closeDate),
        notes: res.data.notes,
        ss_path: res.data.ss_path,
      })
      onClose()
    } catch {
      setError("Failed to save journal entry.")
    } finally {
      setLoading(false)
    }
  }

  const isProfit = form.pnl !== "" && Number(form.pnl) >= 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* 1. Increased width to max-w-3xl */}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journal Trade — {date}</DialogTitle>
        </DialogHeader>

        {/* 2. Changed 50/50 split to a custom ratio and increased gap */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 py-2">

          {/* Left column */}
          <div className="space-y-4">
            {/* Coin pair + direction */}
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Coin Pair</Label>
                <Input
                  placeholder="e.g. BTC/USDT"
                  value={form.coinPair}
                  onChange={e => setForm(p => ({ ...p, coinPair: e.target.value }))}
                  className="h-8 text-xs w-full"
                />
              </div>
              <div className="space-y-1.5 w-28 shrink-0">
                <Label className="text-xs">Direction</Label>
                <div className="flex rounded-md border border-border overflow-hidden h-8">
                  {(["LONG", "SHORT"] as const).map(d => (
                    <button key={d} onClick={() => setForm(p => ({ ...p, positionType: d }))}
                      className={`flex-1 text-xs font-semibold transition-colors
                        ${form.positionType === d
                          ? d === "LONG" ? "bg-green-600 text-white" : "bg-destructive text-white"
                          : "text-muted-foreground hover:bg-muted"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leverage + Margin + PnL */}
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Leverage (x)</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={form.leverage}
                  onChange={e => setForm(p => ({ ...p, leverage: Number(e.target.value) }))}
                  className="h-8 text-xs w-full"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Margin (USDT)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.margin}
                  onChange={e => setForm(p => ({ ...p, margin: e.target.value }))}
                  className="h-8 text-xs w-full"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Realized PnL</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.pnl}
                  onChange={e => setForm(p => ({ ...p, pnl: e.target.value }))}
                  className={`h-8 text-xs w-full ${form.pnl !== "" ? isProfit ? "text-green-600 font-medium" : "text-destructive font-medium" : ""}`}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Open Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.openDate}
                  onChange={e => setForm(p => ({ ...p, openDate: e.target.value }))}
                  className="h-8 text-xs w-full"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-xs">Close Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.closeDate}
                  onChange={e => setForm(p => ({ ...p, closeDate: e.target.value }))}
                  className="h-8 text-xs w-full"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs resize-none h-24 focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Setup reason, entry/exit rationale, lessons learned..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

            {/* PnL preview */}
            {form.pnl !== "" && form.margin !== "" && (
              <div className={`rounded-lg p-3 text-center text-sm font-semibold
                ${isProfit ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-destructive"}`}>
                Realized PnL: {Number(form.pnl) >= 0 ? "+" : ""}${form.pnl}
                {form.margin && (
                  <span className="text-xs font-normal ml-2 opacity-70">
                    ({((Number(form.pnl) / Number(form.margin)) * 100).toFixed(1)}% ROI)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right column — screenshot */}
          <div className="space-y-3">
            <Label className="text-xs">Trade Screenshot</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`rounded-lg border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center w-full
                ${screenshotPreview ? "border-border" : "border-border hover:border-primary/50 bg-muted/10"}
                ${screenshotPreview ? "p-0 overflow-hidden" : "p-6"}`}
              style={{ minHeight: "260px" }}
            >
              {screenshotPreview ? (
                <img
                  src={screenshotPreview}
                  alt="Trade screenshot"
                  className="w-full h-full object-contain max-h-72"
                />
              ) : (
                <div className="text-center space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
                    {/* Assuming you have an ImageIcon imported */}
                    <div className="h-5 w-5 border-2 border-muted-foreground rounded-sm" /> 
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Click to upload screenshot</p>
                  <p className="text-[10px] text-muted-foreground/70">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {screenshotPreview && (
              <Button
                variant="outline" size="sm" className="w-full text-xs"
                onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
              >
                Remove Screenshot
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <DialogFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {/* Assuming Loader2 is imported */}
            {loading && <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />}
            Save Journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// ─── Journal Detail Popup ─────────────────────────────────────
export function JournalDetailDialog({
  open,
  journal,
  onClose,
}: {
  open: boolean
  journal: FutureJournal | null
  onClose: () => void
}) {
  if (!journal) return null
  
  // Fixed mapping to realizedPnl
  const isProfit = journal.realizedPnl >= 0
  const positionSize = journal.leverage * journal.margin

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {journal.coinPair}
            <Badge className={journal.positionType === "LONG"
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-red-500/10 text-red-600 border-red-500/20"}>
              {journal.positionType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                // Fixed format to use closeDate properly
                { label: "Date", value: new Date(journal.closeDate).toLocaleDateString() },
                { label: "Leverage", value: `${journal.leverage}x` },
                { label: "Margin", value: `$${journal.margin}` },
                { label: "Position Size", value: `$${positionSize.toLocaleString()}` },
                {
                  label: "Realized PnL",
                  value: `${isProfit ? "+" : ""}$${journal.realizedPnl}`, // Fixed mapping
                  className: isProfit ? "text-green-600 font-semibold" : "text-destructive font-semibold"
                },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-border p-2.5">
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className={`text-sm font-medium mt-0.5 ${item.className ?? ""}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {journal.notes && (
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1.5">Notes</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{journal.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col h-full">
            <p className="text-xs text-muted-foreground mb-2">Screenshot</p>
            {journal.ss_path ? (
              <div className="rounded-lg border border-border bg-muted/10 flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={journal.ss_path}
                  alt="Trade screenshot"
                  className="w-full h-full object-contain max-h-[600px]"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border flex items-center justify-center flex-1 min-h-[200px]">
                <p className="text-xs text-muted-foreground">No screenshot attached</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  // Update onSuccess to receive the new balances
  onSuccess: (data: BinanceAccountTransferResponseDTO) => void 
  spotBalance: number
  futureBalance: number
  direction: "spot-to-future" | "future-to-spot"
  accountTransfer: AccountTransfer | null
}

export function TransferDialog({
  open,
  onClose,
  onSuccess,
  spotBalance,
  futureBalance,
  direction,
  accountTransfer
}: TransferDialogProps) {
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSpotToFuture = direction === "spot-to-future"
  const availableBalance = isSpotToFuture ? spotBalance : futureBalance
  const fromAccount = isSpotToFuture ? "Spot" : "Futures"
  const toAccount = isSpotToFuture ? "Futures" : "Spot"

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount("")
      setError(null)
    }
  }, [open])

  const handleTransfer = async () => {
    const numAmount = Number(amount)
    
    // Validation
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.")
      return
    }
    if (numAmount > availableBalance) {
      setError(`Insufficient balance. Max available is ${fmtUSD(availableBalance)}`)
      return
    }
    
    // TypeScript Fix: Ensure account IDs exist before calling the API
    if (!accountTransfer || !accountTransfer.fromAccountId || !accountTransfer.toAccountId) {
      setError("Account mapping is missing. Please refresh the page.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // API Call
      const response = await cryptoApi.transferBetweenAccounts({
        fromAccountId: accountTransfer.fromAccountId,
        toAccountId: accountTransfer.toAccountId,
        amount: numAmount
      })

      // Pass the returned DTO back to the parent to instantly update the UI
      onSuccess(response.data)
      onClose()
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data || "Transfer failed. Please try again."
      setError(typeof backendMessage === 'string' ? backendMessage : "Transfer failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Transfer {fromAccount} → {toAccount}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/30 px-3 py-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available in {fromAccount}</span>
              <span className="font-medium">{fmtUSD(availableBalance)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Amount (USD)</Label>
              <button
                onClick={() => { setAmount(String(availableBalance)); setError(null); }}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                Max: {fmtUSD(availableBalance)}
              </button>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleTransfer()}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <p className="text-xs text-muted-foreground">
            Funds will be moved from your {fromAccount} wallet to your {toAccount} account.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading || !amount}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




import { useEffect,useMemo } from "react"
import { ImageIcon, Loader2, Search } from "lucide-react"
import { BinanceAccountTransferResponseDTO, cryptoApi, FutureJournalRequestDto, SpotTradeDto } from "@/lib/api/binance"
import { Badge } from "@/components/ui/badge"


interface SpotTradeDialogProps {
  open: boolean
  accountId: number
  bucketId: number
  spotBalance: number
  ownedCoins: any[]
  onClose: () => void
  onSuccess: () => void
}

export function SpotTradeDialog({
  open,
  accountId,
  bucketId,
  spotBalance,
  ownedCoins,
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

  const filteredCoins = useMemo(() => {
    if (type === "SELL") {
      // Only show coins you own
      return ownedCoins
        .map(c => c.coin)
        .filter(c => c.toLowerCase().startsWith(search.toLowerCase()))
    }
    // BUY logic shows all coins
    return search.length >= 1
      ? allCoins.filter(c => c.toLowerCase().startsWith(search.toLowerCase())).slice(0, 20)
      : []
  }, [search, allCoins, ownedCoins, type])

  

  const selectedOwnedCoin = useMemo(() => 
    ownedCoins.find(c => c.coin === selectedCoin), 
  [selectedCoin, ownedCoins])

  // Quantity the user will receive or sell
  const quantity = useMemo(() => {
    const amountNum = Number(investAmount)
    if (!currentPrice || !investAmount || isNaN(amountNum) || amountNum <= 0) return null
    
    let calcQty = amountNum / currentPrice
    
    // SAFEGUARD: Prevent floating point errors when selling MAX
    if (type === "SELL" && selectedOwnedCoin) {
      // If the calculated quantity is practically equal to or slightly exceeds the total, cap it exactly to totalQuantity
      if (Math.abs(calcQty - selectedOwnedCoin.totalQuantity) < 0.000001 || calcQty > selectedOwnedCoin.totalQuantity) {
        calcQty = selectedOwnedCoin.totalQuantity
      }
    }
    
    return calcQty
  }, [currentPrice, investAmount, type, selectedOwnedCoin])

  // Estimated realized P&L for this sell (only meaningful when SELL + coin owned)
  const estimatedPnl = useMemo(() => {
    if (type !== "SELL" || quantity === null || !currentPrice || !selectedOwnedCoin) return null
    return (currentPrice - selectedOwnedCoin.avgPrice) * quantity
  }, [type, quantity, currentPrice, selectedOwnedCoin])

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

          {/* Coin selection */}
          <div className="space-y-1.5">
            <Label className="text-xs">Coin</Label>
            
            {type === "BUY" ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search symbol e.g. BTC, ETH..."
                    value={selectedCoin ?? search}
                    onChange={e => { setSearch(e.target.value); setSelectedCoin(null); setCurrentPrice(null) }}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Dropdown results for BUY */}
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
              </>
            ) : (
              /* Dropdown for SELL */
              <Select 
                value={selectedCoin || ""} 
                onValueChange={(val) => { 
                  setSelectedCoin(val); 
                  setCurrentPrice(null);
                  setInvestAmount(""); // Reset amount when changing coins
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a coin to sell..." />
                </SelectTrigger>
                <SelectContent>
                  {ownedCoins.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">No coins available to sell.</p>
                  ) : (
                    ownedCoins.map((c) => (
                      <SelectItem key={c.coin} value={c.coin}>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{c.coin}</span>
                          <span className="text-xs text-muted-foreground">Avail: {c.totalQuantity}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                  className="text-[10px] text-primary hover:underline font-medium">
                  Max: {fmtUSD(spotBalance)}
                </button>
              )}

              {type === "SELL" && selectedOwnedCoin && currentPrice && (
                <button
                  onClick={() => { 
                    // Calculate exact USDT value of all held coins
                    const maxUsdt = selectedOwnedCoin.totalQuantity * currentPrice;
                    // Use string representation to preserve decimal accuracy
                    setInvestAmount(maxUsdt.toString()); 
                    setError(null);
                  }}
                  className="text-[10px] text-primary hover:underline font-medium">
                  Sell All: {selectedOwnedCoin.totalQuantity} {selectedCoin}
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
                <span className="font-semibold">{quantity.toFixed(8)} {selectedCoin}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">At price</span>
                <span className="text-muted-foreground">{fmtUSD(currentPrice)}/coin</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border pt-1.5">
                <span className="text-muted-foreground">Total Value (USDT)</span>
                <span className="font-semibold">{fmtUSD(Number(investAmount))}</span>
              </div>

              {/* NEW: show realized P&L only for SELL */}
              {type === "SELL" && estimatedPnl !== null && selectedOwnedCoin && (
                <div className="flex items-center justify-between text-xs border-t border-border pt-1.5">
                  <span className="text-muted-foreground">
                    Est. Profit/Loss <span className="opacity-60">(avg {fmtUSD(selectedOwnedCoin.avgPrice)})</span>
                  </span>
                  <span className={`font-semibold ${estimatedPnl >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {estimatedPnl >= 0 ? "+" : ""}{fmtUSD(estimatedPnl)}
                  </span>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedCoin || !currentPrice || !investAmount}
            className={type === "SELL" ? "bg-destructive  hover:bg-destructive/90" : ""}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {type === "BUY" ? "Buy" : "Sell"} {selectedCoin ?? "Coin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}