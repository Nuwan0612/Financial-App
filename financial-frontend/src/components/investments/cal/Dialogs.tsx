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

          {/* Fund Name Input */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Fund Name</Label>
            <Input
              id="name"
              placeholder="e.g. CAL Quant Equity Fund"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
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
  defaultType,
  onClose,
  onSuccess,
}: {
  open: boolean
  fund: CalFund | null
  defaultType: CalTransactionType
  onClose: () => void
  onSuccess: (txn: CalTransactionResponseDTO, updatedFund: CalFund) => void
}) {
  const [type, setType] = useState<CalTransactionType>(defaultType)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setType(defaultType)
      setAmount("")
      setError(null)
    }
  }, [open, defaultType])

  const handleSubmit = async () => {
    if (!fund) return
    const numAmount = Number(amount)

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    // Validate redeem — cannot redeem more than current value
    if (type === "REDEEM" && numAmount > fund.currentValue) {
      setError(`Cannot redeem more than current value (${new Intl.NumberFormat("en-LK", {
        style: "currency", currency: "LKR", maximumFractionDigits: 0
      }).format(fund.currentValue)}).`)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const txn = await calTransactionsApi.create({
        calFundId: fund.id,
        type,
        amount: numAmount,
      })

      // Update fund values locally
      const updatedFund: CalFund = {
        ...fund,
        totalInvested: type === "INVEST"
          ? fund.totalInvested + numAmount
          : fund.totalInvested,
        currentValue: type === "INVEST"
          ? fund.currentValue + numAmount
          : fund.currentValue - numAmount,
        totalProfit: type === "INVEST"
          ? fund.totalProfit
          : fund.totalProfit - numAmount,
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

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {type === "INVEST" ? "Invest In" : "Redeem From"} — {fund.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Fund info */}
          <div className="rounded-lg bg-muted/30 px-3 py-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Invested</span>
              <span className="font-medium">{fmt(fund.totalInvested)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current Value</span>
              <span className="font-medium">{fmt(fund.currentValue)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available to Redeem</span>
              <span className="font-medium text-green-600">{fmt(fund.currentValue)}</span>
            </div>
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label>Transaction Type</Label>
            <Select value={type} onValueChange={v => { setType(v as CalTransactionType); setError(null) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INVEST">Invest</SelectItem>
                <SelectItem value="REDEEM">Redeem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (LKR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(null) }}
            />
            {type === "REDEEM" && amount && Number(amount) > 0 && Number(amount) <= fund.currentValue && (
              <p className="text-xs text-muted-foreground">
                Remaining after redeem: {fmt(fund.currentValue - Number(amount))}
              </p>
            )}
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