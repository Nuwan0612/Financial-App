import { useState } from "react"
import { Loader2 } from "lucide-react"
import { calFundsApi, CalAssetCategory, CalFundResponseDTO } from "@/lib/api/cal" // Adjust path

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