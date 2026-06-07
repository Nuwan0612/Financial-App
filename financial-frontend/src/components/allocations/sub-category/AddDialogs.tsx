import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MainCategory, mainCategoryApi, MainCategoryDto, SubCategory, subCategoryApi, SubCategoryDto } from "@/lib/api/allocations"
import { Account, accountsApi } from "@/lib/api/accounts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export function AddSubCategoryDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (subCategory: SubCategory) => void
}) {
  const [form, setForm] = useState<SubCategoryDto>({
    name: "",
    mainCategoryId: 0,
    percentage: 0,
    accountId: 0,
  })
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true)
        const [mainCatRes, accountsRes] = await Promise.all([
          mainCategoryApi.getAll(),
          accountsApi.getAll(),
        ])
        setMainCategories(mainCatRes.data)
        setAccounts(accountsRes.data)

        // Set defaults to first item
        setForm(prev => ({
          ...prev,
          mainCategoryId: mainCatRes.data[0]?.id ?? 0,
          accountId: accountsRes.data[0]?.id ?? 0,
        }))
      } catch {
        setError("Failed to load categories or accounts.")
      } finally {
        setLoadingDropdowns(false)
      }
    }
    fetchDropdowns()
  }, [open])

  const handleSubmit = async () => {
    if (!form.name || !form.mainCategoryId || !form.accountId || !form.percentage) {
      setError("Please fill in all fields.")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await subCategoryApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "", mainCategoryId: 0, percentage: 0, accountId: 0 })
    } catch {
      setError("Failed to add sub category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Sub Category</DialogTitle>
        </DialogHeader>

        {loadingDropdowns ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Church, Stock Portfolio"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Percentage */}
            <div className="space-y-1.5">
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="e.g. 10"
                min={0.01}
                max={100}
                step={0.01}
                value={form.percentage || ""}
                onChange={e => setForm({ ...form, percentage: Number(e.target.value) })}
              />
            </div>

            {/* Main Category dropdown */}
            <div className="space-y-1.5">
              <Label>Main Category</Label>
              <Select
                value={String(form.mainCategoryId)}
                onValueChange={val => setForm({ ...form, mainCategoryId: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account dropdown */}
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select
                value={String(form.accountId)}
                onValueChange={val => setForm({ ...form, accountId: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({acc.type})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingDropdowns}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Sub Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




export function UpdateSubCategoryDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: SubCategory | null
  onClose: () => void
  onUpdated: (subCategory: SubCategory) => void
}) {
  const [form, setForm] = useState<SubCategoryDto>({
    name: "",
    mainCategoryId: 0,
    percentage: 0,
    accountId: 0,
  })
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dropdowns + pre-fill form when dialog opens
  useEffect(() => {
    if (!open || !updateItem) return
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true)
        const [mainCatRes, accountsRes] = await Promise.all([
          mainCategoryApi.getAll(),
          accountsApi.getAll(),
        ])
        setMainCategories(mainCatRes.data)
        setAccounts(accountsRes.data)

        // Pre-fill with existing values
        setForm({
          name: updateItem.name,
          mainCategoryId: updateItem.mainCategoryId,
          percentage: updateItem.percentage,
          accountId: updateItem.accountId,
        })
        setError(null)
      } catch {
        setError("Failed to load categories or accounts.")
      } finally {
        setLoadingDropdowns(false)
      }
    }
    fetchDropdowns()
  }, [open, updateItem])

  const handleSubmit = async () => {
    if (!updateItem?.id) return
    if (!form.name || !form.mainCategoryId || !form.accountId || !form.percentage) {
      setError("Please fill in all fields.")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await subCategoryApi.update(updateItem.id, form)
      onUpdated(res.data)
      onClose()
    } catch {
      setError("Failed to update sub category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Sub Category</DialogTitle>
        </DialogHeader>

        {loadingDropdowns ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Church, Stock Portfolio"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Percentage */}
            <div className="space-y-1.5">
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="e.g. 10"
                min={0.01}
                max={100}
                step={0.01}
                value={form.percentage || ""}
                onChange={e => setForm({ ...form, percentage: Number(e.target.value) })}
              />
            </div>

            {/* Main Category dropdown */}
            <div className="space-y-1.5">
              <Label>Main Category</Label>
              <Select
                value={String(form.mainCategoryId)}
                onValueChange={val => setForm({ ...form, mainCategoryId: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account dropdown */}
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select
                value={String(form.accountId)}
                onValueChange={val => setForm({ ...form, accountId: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({acc.type})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingDropdowns}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Sub Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


