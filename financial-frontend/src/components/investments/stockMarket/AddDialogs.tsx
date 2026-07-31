"use client"

import { useEffect, useState } from "react"
import { Loader2, Pencil, Plus, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"


//============================================================================ 
//                                 SECTORS                               
//============================================================================
import { Sector, sectorsApi } from "@/lib/api/stockMarket"

export function SectorDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)

  // Add state
  const [newName, setNewName] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    sectorsApi.getAll()
      .then(res => setSectors(res.data))
      .catch(() => console.error("Failed to fetch sectors"))
      .finally(() => setLoading(false))
  }, [open])

  const handleAdd = async () => {
    if (!newName.trim()) { setAddError("Name is required."); return }
    try {
      setAddLoading(true)
      setAddError(null)
      const res = await sectorsApi.create({ name: newName.trim() })
      setSectors(prev => [...prev, res.data])
      setNewName("")
    } catch {
      setAddError("Failed to add sector.")
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditStart = (sector: Sector) => {
    setEditingId(sector.id)
    setEditName(sector.name)
  }

  const handleEditSave = async (id: number) => {
    if (!editName.trim()) return
    try {
      setEditLoading(true)
      const res = await sectorsApi.update(id, { name: editName.trim() })
      setSectors(prev => prev.map(s => s.id === id ? res.data : s))
      setEditingId(null)
    } catch {
      console.error("Failed to update sector")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deletingId === null) return
    try {
      setDeleteLoading(true)
      await sectorsApi.delete(deletingId)
      setSectors(prev => prev.filter(s => s.id !== deletingId))
      setDeletingId(null)
    } catch {
      console.error("Failed to delete sector")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Sectors</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Add new sector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Add New Sector</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Banking, Telecom"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setAddError(null) }}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  className="h-9"
                />
                <Button size="sm" onClick={handleAdd} disabled={addLoading} className="shrink-0">
                  {addLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              {addError && <p className="text-xs text-destructive">{addError}</p>}
            </div>

            {/* Existing sectors list */}
            <div className="space-y-1.5">
              <Label className="text-xs">Existing Sectors</Label>

              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sectors.length === 0 ? (
                <div className="rounded-lg border border-border py-6 text-center">
                  <p className="text-xs text-muted-foreground">No sectors yet.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {sectors.map(sector => (
                        <tr key={sector.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 border-r border-border">
                            {editingId === sector.id ? (
                              <Input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleEditSave(sector.id)}
                                className="h-7 text-xs"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm">{sector.name}</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right w-24">
                            {editingId === sector.id ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm" variant="default"
                                  className="h-7 text-xs px-2"
                                  onClick={() => handleEditSave(sector.id)}
                                  disabled={editLoading}
                                >
                                  {editLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                </Button>
                                <Button
                                  size="sm" variant="outline"
                                  className="h-7 text-xs px-2"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost" size="icon" className="h-7 w-7"
                                  onClick={() => handleEditStart(sector)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => setDeletingId(sector.id)}
                                >
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sector?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">
                "{sectors.find(s => s.id === deletingId)?.name}"
              </span>.
              Any holdings in this sector will lose their sector assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


//============================================================================
//                                 COMPANIES                               
//============================================================================

import { investmentCompaniesApi, InvestmentCompany, InvestmentCompanyRequest } from "@/lib/api/stockMarket"

export function AddCompanyDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (company: InvestmentCompany) => void
}) {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loadingSectors, setLoadingSectors] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<InvestmentCompanyRequest>({
    symbol: "",
    name: "",
    isSp20: false,
    currentPrice: 0,
    sectorId: 0,
  })

  useEffect(() => {
    if (!open) return
    setLoadingSectors(true)
    sectorsApi.getAll()
      .then(res => {
        setSectors(res.data)
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, sectorId: res.data[0].id }))
        }
      })
      .catch(() => setError("Failed to load sectors."))
      .finally(() => setLoadingSectors(false))
  }, [open])

  const handleSubmit = async () => {
    if (!form.symbol.trim()) { setError("Symbol is required."); return }
    if (!form.name.trim()) { setError("Name is required."); return }
    if (!form.sectorId) { setError("Please select a sector."); return }

    try {
      setLoading(true)
      setError(null)
      const res = await investmentCompaniesApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ symbol: "", name: "", isSp20: false, currentPrice: 0, sectorId: sectors[0]?.id ?? 0 })
    } catch {
      setError("Failed to add company. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>

        {loadingSectors ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">

            {/* Symbol + Name side by side */}
            <div className="flex gap-3">
              <div className="space-y-1.5 w-28">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g. JKH"
                  value={form.symbol}
                  onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Keells Holdings"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* Current Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Current Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={form.currentPrice || ""}
                onChange={e => setForm({ ...form, currentPrice: Number(e.target.value) })}
              />
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select
                value={String(form.sectorId)}
                onValueChange={v => setForm({ ...form, sectorId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* S&P 20 toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">S&P 20</p>
                <p className="text-xs text-muted-foreground">Is this company in the S&P 20 index?</p>
              </div>
              <Switch
                checked={form.isSp20}
                onCheckedChange={v => setForm({ ...form, isSp20: v })}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || loadingSectors}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Company
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


//============================================================================
//                                 COMPANY DETAIL
//============================================================================



//=============================================================================
//                                  TRADES
//=============================================================================

import { tradesApi, TradeTransactionRequest, TradeTransaction } from "@/lib/api/stockMarket"

export function AddTradeDialog({
  open,
  onClose,
  onSuccess,
  companyId,
  accountId,
  accountName,
  bucketId,
  bucketName,
  currentPrice,
  buyingPower,
  totalActiveShares,
}: {
  open: boolean
  onClose: () => void
  onSuccess: (trade: TradeTransaction) => void
  companyId: number
  accountId: number
  accountName: string
  bucketId: number
  bucketName: string
  currentPrice: number
  buyingPower: number
  totalActiveShares: number
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<TradeTransactionRequest>({
    companyId: companyId,
    type: "BUY",
    quantity: 0,
    executionPrice: currentPrice,
    accountId: accountId, 
    bucketId: bucketId,  
  })

  // Reset form when opened, ensuring the correct IDs are securely set
  useEffect(() => {
    if (open) {
      setForm({ 
        companyId, 
        type: "BUY", 
        quantity: 0, 
        executionPrice: currentPrice, 
        accountId, 
        bucketId 
      })
      setError(null)
    }
  }, [open, companyId, accountId, bucketId, currentPrice])

  const handleSubmit = async () => {
    // 1. Basic Input Validations
    if (form.quantity <= 0) { 
      setError("Quantity must be greater than zero."); 
      return; 
    }
    if (form.executionPrice <= 0) { 
      setError("Execution price must be greater than zero."); 
      return; 
    }

    // 2. Business Logic Validations
    const totalTradeValue = form.quantity * form.executionPrice;

    if (form.type === "BUY") {
      if (totalTradeValue > buyingPower) {
        setError(`Insufficient buying power. This trade costs LKR ${totalTradeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}, but you only have LKR ${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })} available.`);
        return;
      }
    }

    if (form.type === "SELL") {
      if (form.quantity > totalActiveShares) {
        setError(`Insufficient shares. You are trying to sell ${form.quantity} shares, but you only own ${totalActiveShares}.`);
        return;
      }
    }

    // 3. API Execution
    try {
      setLoading(true)
      setError(null)
      const res = await tradesApi.create(form)
      onSuccess(res.data)
      onClose()
    } catch {
      setError("Failed to add transaction. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Read-Only Account & Bucket Display */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label>Account</Label>
              <Input 
                disabled 
                value={accountName} 
                className="bg-muted text-muted-foreground font-medium" 
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label>Funding Bucket</Label>
              <Input 
                disabled 
                value={bucketName} 
                className="bg-muted text-muted-foreground font-medium" 
              />
            </div>
          </div>

          {/* Type Selection & Dynamic Capacity */}
          <div className="flex gap-3">
            
            {/* Left Column: Dropdown */}
            <div className="space-y-1.5 flex-1">
              <Label>Transaction Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: "BUY" | "SELL") => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY" className="text-green-600 font-medium">BUY</SelectItem>
                  <SelectItem value="SELL" className="text-red-600 font-medium">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right Column: Styled Metric Box */}
            <div className="space-y-1.5 flex-1">
              <Label className="text-muted-foreground">
                {form.type === "BUY" ? "Available Buying Power" : "Available Shares to Sell"}
              </Label>
              <div className="flex items-center h-9 w-full rounded-md border border-border bg-muted/30 px-3 py-1 shadow-sm">
                <span className={`text-sm font-semibold ${form.type === "BUY" ? "text-blue-500" : "text-foreground"}`}>
                  {form.type === "BUY" 
                    ? `LKR ${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : totalActiveShares.toLocaleString()}
                </span>
              </div>
            </div>
            
          </div>

          <div className="flex gap-3">
            {/* Quantity */}
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.quantity || ""}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            {/* Price */}
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="price">Execution Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder={currentPrice.toString()}
                value={form.executionPrice || ""}
                onChange={e => setForm({ ...form, executionPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}