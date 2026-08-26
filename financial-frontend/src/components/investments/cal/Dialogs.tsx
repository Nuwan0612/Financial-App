import { useState } from "react"
import { Loader2 } from "lucide-react"
import { calFundsApi, CalAssetCategory, CalFundResponseDTO, CalTransactionResponseDTO, calTransactionsApi } from "@/lib/api/cal" // Adjust path

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddCalFundDialogProps {
  open: boolean
  onClose: () => void
  accountId: number
  accountName: string
  bucketId: number
  bucketName: string
  onSuccess: (newFund: CalFundResponseDTO) => void
}

//==========================================================================
//                               ADD FUND
//==========================================================================

export function AddCalFundDialog({
  open,
  onClose,
  accountId,
  accountName,
  bucketId,
  bucketName,
  onSuccess,
}: AddCalFundDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<CalAssetCategory>("UNIT_TRUST")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- NEW STATE FOR FETCHED FUNDS ---
  const [availableFunds, setAvailableFunds] = useState<string[]>([])
  const [fetchingFunds, setFetchingFunds] = useState(false)

 useEffect(() => {
    if (!open) return

    const getFunds = async () => {
      setFetchingFunds(true)
      try {
        const res = await fetch("/api/cal-funds")
        const data = await res.json()
        
        // FIX: Extract only the 'fundName' string from each returned object
        const fundNamesOnly = data.map((fund: { fundName: string, sellPrice: number, buyPrice: number }) => fund.fundName)
        
        setAvailableFunds(fundNamesOnly)
      } catch {
        console.error("Failed to fetch CAL funds")
      } finally {
        setFetchingFunds(false)
      }
    }

    getFunds()
  }, [open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Fund name is required.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const payload = {
        name: name.trim(),
        category,
        accountId,
        bucketId
      }

      const res = await calFundsApi.create(payload)
      onSuccess(res.data)
      
      // Reset form after successful submission
      setName("")
      setCategory("UNIT_TRUST")
      onClose()
      
    } catch (err) {
      setError("Failed to create fund. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog closure to clear errors
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New CAL Fund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* Read-Only Account & Bucket Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Input 
                value={accountName} 
                disabled 
                className="bg-muted/50 text-muted-foreground font-medium" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Funding Bucket</Label>
              <Input 
                value={bucketName} 
                disabled 
                className="bg-muted/50 text-muted-foreground font-medium" 
              />
            </div>
          </div>

          {/* --- UPDATED FUND NAME INPUT WITH DATALIST --- */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex justify-between">
              Fund Name 
              {fetchingFunds && <span className="text-xs text-muted-foreground animate-pulse">Loading live funds...</span>}
            </Label>
            <Input
              id="name"
              list="cal-funds-list" // Connects the input to the datalist below
              placeholder="Select or type fund name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {/* The datalist acts as an autocomplete dropdown */}
            <datalist id="cal-funds-list">
              {availableFunds.map((fundName, index) => (
                <option key={index} value={fundName} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Select from the list or type manually if the fund is missing.
            </p>
          </div>

          {/* Asset Category Dropdown */}
          <div className="space-y-1.5">
            <Label>Asset Category</Label>
            <Select 
              value={category} 
              onValueChange={(v: CalAssetCategory) => setCategory(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIT_TRUST" className="font-medium">Unit Trust</SelectItem>
                <SelectItem value="T_BILL" className="font-medium">Treasury Bill</SelectItem>
                <SelectItem value="BOND" className="font-medium">Bond</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Fund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


//==========================================================================
//                               ADD TRANSACTIONS
//==========================================================================

import { useEffect } from "react"
import { CalFund, CalTransactionType } from "./types"

export function TransactionDialog({
  open,
  fund,
  availableRedeemable,
  defaultType,
  onClose,
  onSuccess,
}: {
  open: boolean
  fund: CalFund | null
  availableRedeemable: number
  defaultType: CalTransactionType
  onClose: () => void
  onSuccess: (txn: CalTransactionResponseDTO, updatedFund: CalFund) => void
}) {
  const [type, setType] = useState<CalTransactionType>(defaultType)
  const [amount, setAmount] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch live price when dialog opens or type changes
  useEffect(() => {
    if (!open || !fund) return

    const fetchLivePrice = async () => {
      setFetchingPrice(true)
      try {
        const res = await fetch("/api/cal-funds")
        const data = await res.json()
        
        const liveFund = data.find((f: any) => f.fundName === fund.name)
        
        if (liveFund) {
          // You BUY at the fund's Selling Price, you REDEEM at the fund's Buying Price
          const applicablePrice = type === "INVEST" ? liveFund.sellPrice : liveFund.buyPrice
          if (applicablePrice > 0) {
            setUnitPrice(applicablePrice.toString())
          }
        }
      } catch (err) {
        console.error("Failed to fetch live prices", err)
      } finally {
        setFetchingPrice(false)
      }
    }

    fetchLivePrice()
    setAmount("")
    setError(null)
  }, [open, fund, type])

  // Calculate estimated units dynamically
  const numAmount = Number(amount)
  const numPrice = Number(unitPrice)
  const estimatedUnits = (numAmount > 0 && numPrice > 0) ? (numAmount / numPrice) : 0

  const handleSubmit = async () => {
    if (!fund) return

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.")
      return
    }
    if (!unitPrice || isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid unit price.")
      return
    }

    if (type === "REDEEM" && numAmount > fund.currentValue) {
      setError(`Cannot redeem more than current value (${fmt(fund.currentValue)}).`)
      return
    }
    
    // Check if you have enough units to redeem
    if (type === "REDEEM" && estimatedUnits > fund.totalUnits) {
      setError(`Cannot redeem more units (${estimatedUnits.toFixed(4)}) than you own (${fund.totalUnits.toFixed(4)}).`)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = {
        calFundId: fund.id,
        type,
        amount: numAmount,
        buyPrice: numPrice,
        numberOfUnits: estimatedUnits
      }

      const txn = await calTransactionsApi.create(payload)

      // Optimistic UI Update
      const updatedFund: CalFund = {
        ...fund,
        totalInvested: type === "INVEST" ? fund.totalInvested + numAmount : fund.totalInvested - numAmount,
        currentValue: type === "INVEST" ? fund.currentValue + numAmount : fund.currentValue - numAmount,
        totalUnits: type === "INVEST" ? fund.totalUnits + estimatedUnits : fund.totalUnits - estimatedUnits,
        // Profit remains unchanged during the actual transaction event until NAV updates
        totalProfit: fund.totalProfit 
      }

      onSuccess(txn.data, updatedFund)
      onClose()
    } catch {
      setError("Failed to process transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!fund) return null
  const fmt = (n: number) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{type === "INVEST" ? "Invest In" : "Redeem From"} — {fund.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Fund info banner */}
          <div className="rounded-lg bg-muted/30 px-3 py-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available to Redeem</span>
              <span className="font-medium text-green-600">{fmt(availableRedeemable)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Units Owned</span>
              <span className="font-medium">{fund.totalUnits ? fund.totalUnits.toFixed(4) : "0.0000"} units</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Transaction Type</Label>
            <Select value={type} onValueChange={v => { setType(v as CalTransactionType); setError(null) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INVEST">Invest</SelectItem>
                <SelectItem value="REDEEM">Redeem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (LKR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(null) }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price" className="flex justify-between">
                Unit Price
                {fetchingPrice && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0.0000"
                value={unitPrice}
                onChange={e => { setUnitPrice(e.target.value); setError(null) }}
              />
            </div>
          </div>

          {/* Dynamic Units Display */}
          <div className="rounded border border-dashed p-3 text-center bg-muted/10">
            <p className="text-xs text-muted-foreground mb-1">Estimated Units</p>
            <p className="text-lg font-semibold text-primary">
              {estimatedUnits > 0 ? estimatedUnits.toFixed(4) : "0.0000"}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={type === "REDEEM" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {type === "INVEST" ? "Invest" : "Redeem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}





//==========================================================================
//                        CAL CURRENT PRICE UPDATE
//==========================================================================

interface UpdateValueDialogProps {
  open: boolean
  onClose: () => void
  fund: CalFund
  onSuccess: (updatedFund: CalFund) => void
}

export function UpdateValueDialog({
  open,
  onClose,
  fund,
  onSuccess,
}: UpdateValueDialogProps) {
  const [newValue, setNewValue] = useState(fund.currentValue.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset the input to the current fund value whenever the dialog opens
  useEffect(() => {
    if (open) {
      setNewValue(fund.currentValue.toString())
      setError(null)
    }
  }, [open, fund.currentValue])

  const handleSubmit = async () => {
    const numValue = Number(newValue)
    
    if (isNaN(numValue) || numValue < 0) {
      setError("Please enter a valid positive number.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const res = await calFundsApi.updateValue(fund.id, numValue)
      
      // Pass the updated fund back to the parent to update the UI instantly
      onSuccess(res.data)
      onClose()
    } catch (err) {
      setError("Failed to update fund value. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Current Value</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>New Value (LKR)</Label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}