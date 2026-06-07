// src/components/accounts/AccountDialogs.tsx
"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accountsApi, Account, AccountDto } from "@/lib/api/accounts"

// ─── Add Dialog ───────────────────────────────────────────────
export function AddAccountDialog({
  open,
  type,
  onClose,
  onAdded,
}: {
  open: boolean
  type: "Bank" | "Investment"
  onClose: () => void
  onAdded: (account: Account) => void
}) {
  const [form, setForm] = useState({ name: "", currentBalance: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name) { setError("Please enter a name."); return }
    try {
      setLoading(true)
      setError(null)
      const dto: AccountDto = {
        name: form.name,
        type,                          // ← auto set from prop
        currentBalance: form.currentBalance,
      }
      const res = await accountsApi.create(dto)
      onAdded(res.data)
      onClose()
      setForm({ name: "", currentBalance: 0 })
    } catch {
      setError("Failed to add account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {type} Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder={type === "Bank" ? "e.g. NSB, COMB" : "e.g. Stock Market, Binance"}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Opening Balance (LKR)</Label>
            <Input
              type="number"
              placeholder="0"
              value={form.currentBalance || ""}
              onChange={e => setForm({ ...form, currentBalance: Number(e.target.value) })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Update Dialog ────────────────────────────────────────────
export function UpdateAccountDialog({
  open,
  account,
  onClose,
  onUpdated,
}: {
  open: boolean
  account: Account | null
  onClose: () => void
  onUpdated: (account: Account) => void
}) {
  const [form, setForm] = useState({ name: "", currentBalance: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (account) {
      setForm({ name: account.name, currentBalance: account.currentBalance })
      setError(null)
    }
  }, [account, open])

  const handleSubmit = async () => {
    if (!account?.id) return
    if (!form.name) { setError("Please enter a name."); return }
    try {
      setLoading(true)
      setError(null)
      const res = await accountsApi.update(account.id, {
        name: form.name,
        type: account.type,           // ← keep existing type
        currentBalance: form.currentBalance,
      })
      onUpdated(res.data)
      onClose()
    } catch {
      setError("Failed to update account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update {account?.type} Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Current Balance (LKR)</Label>
            <Input
              type="number"
              value={form.currentBalance || ""}
              onChange={e => setForm({ ...form, currentBalance: Number(e.target.value) })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}