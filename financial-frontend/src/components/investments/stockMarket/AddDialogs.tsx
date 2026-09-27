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
import { useRef } from "react"
import { Search, Check } from "lucide-react"

//============================================================================ 
//                                 SECTORS                               
//============================================================================
import { Sector, sectorsApi } from "@/lib/api/stockMarket"

// export function SectorDialog({
//   open,
//   onClose,
// }: {
//   open: boolean
//   onClose: () => void
// }) {
//   const [sectors, setSectors] = useState<Sector[]>([])
//   const [loading, setLoading] = useState(true)

//   // Add state
//   const [newName, setNewName] = useState("")
//   const [addLoading, setAddLoading] = useState(false)
//   const [addError, setAddError] = useState<string | null>(null)

//   // Edit state
//   const [editingId, setEditingId] = useState<number | null>(null)
//   const [editName, setEditName] = useState("")
//   const [editLoading, setEditLoading] = useState(false)

//   // Delete state
//   const [deletingId, setDeletingId] = useState<number | null>(null)
//   const [deleteLoading, setDeleteLoading] = useState(false)

//   useEffect(() => {
//     if (!open) return
//     setLoading(true)
//     sectorsApi.getAll()
//       .then(res => setSectors(res.data))
//       .catch(() => console.error("Failed to fetch sectors"))
//       .finally(() => setLoading(false))
//   }, [open])

//   const handleAdd = async () => {
//     if (!newName.trim()) { setAddError("Name is required."); return }
//     try {
//       setAddLoading(true)
//       setAddError(null)
//       const res = await sectorsApi.create({ name: newName.trim() })
//       setSectors(prev => [...prev, res.data])
//       setNewName("")
//     } catch {
//       setAddError("Failed to add sector.")
//     } finally {
//       setAddLoading(false)
//     }
//   }

//   const handleEditStart = (sector: Sector) => {
//     setEditingId(sector.id)
//     setEditName(sector.name)
//   }

//   const handleEditSave = async (id: number) => {
//     if (!editName.trim()) return
//     try {
//       setEditLoading(true)
//       const res = await sectorsApi.update(id, { name: editName.trim() })
//       setSectors(prev => prev.map(s => s.id === id ? res.data : s))
//       setEditingId(null)
//     } catch {
//       console.error("Failed to update sector")
//     } finally {
//       setEditLoading(false)
//     }
//   }

//   const handleDelete = async () => {
//     if (deletingId === null) return
//     try {
//       setDeleteLoading(true)
//       await sectorsApi.delete(deletingId)
//       setSectors(prev => prev.filter(s => s.id !== deletingId))
//       setDeletingId(null)
//     } catch {
//       console.error("Failed to delete sector")
//     } finally {
//       setDeleteLoading(false)
//     }
//   }

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Manage Sectors</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4 py-2">

//             {/* Add new sector */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Add New Sector</Label>
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="e.g. Banking, Telecom"
//                   value={newName}
//                   onChange={e => { setNewName(e.target.value); setAddError(null) }}
//                   onKeyDown={e => e.key === "Enter" && handleAdd()}
//                   className="h-9"
//                 />
//                 <Button size="sm" onClick={handleAdd} disabled={addLoading} className="shrink-0">
//                   {addLoading
//                     ? <Loader2 className="h-4 w-4 animate-spin" />
//                     : <Plus className="h-4 w-4" />}
//                 </Button>
//               </div>
//               {addError && <p className="text-xs text-destructive">{addError}</p>}
//             </div>

//             {/* Existing sectors list */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Existing Sectors</Label>

//               {loading ? (
//                 <div className="flex items-center justify-center py-6">
//                   <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
//                 </div>
//               ) : sectors.length === 0 ? (
//                 <div className="rounded-lg border border-border py-6 text-center">
//                   <p className="text-xs text-muted-foreground">No sectors yet.</p>
//                 </div>
//               ) : (
//                 <div className="rounded-lg border border-border overflow-hidden max-h-64 overflow-y-auto">
//                   <table className="w-full text-sm border-collapse">
//                     <tbody>
//                       {sectors.map(sector => (
//                         <tr key={sector.id} className="border-b border-border last:border-0 hover:bg-muted/20">
//                           <td className="px-3 py-2 border-r border-border">
//                             {editingId === sector.id ? (
//                               <Input
//                                 value={editName}
//                                 onChange={e => setEditName(e.target.value)}
//                                 onKeyDown={e => e.key === "Enter" && handleEditSave(sector.id)}
//                                 className="h-7 text-xs"
//                                 autoFocus
//                               />
//                             ) : (
//                               <span className="text-sm">{sector.name}</span>
//                             )}
//                           </td>
//                           <td className="px-2 py-2 text-right w-24">
//                             {editingId === sector.id ? (
//                               <div className="flex justify-end gap-1">
//                                 <Button
//                                   size="sm" variant="default"
//                                   className="h-7 text-xs px-2"
//                                   onClick={() => handleEditSave(sector.id)}
//                                   disabled={editLoading}
//                                 >
//                                   {editLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
//                                 </Button>
//                                 <Button
//                                   size="sm" variant="outline"
//                                   className="h-7 text-xs px-2"
//                                   onClick={() => setEditingId(null)}
//                                 >
//                                   Cancel
//                                 </Button>
//                               </div>
//                             ) : (
//                               <div className="flex justify-end gap-1">
//                                 <Button
//                                   variant="ghost" size="icon" className="h-7 w-7"
//                                   onClick={() => handleEditStart(sector)}
//                                 >
//                                   <Pencil className="h-3 w-3" />
//                                 </Button>
//                                 <Button
//                                   variant="ghost" size="icon"
//                                   className="h-7 w-7 text-destructive hover:text-destructive"
//                                   onClick={() => setDeletingId(sector.id)}
//                                 >
//                                   <Trash2Icon className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={onClose}>Close</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete confirmation */}
//       <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Sector?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete{" "}
//               <span className="font-semibold">
//                 "{sectors.find(s => s.id === deletingId)?.name}"
//               </span>.
//               Any holdings in this sector will lose their sector assignment.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={deleteLoading}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }

export function SectorDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  // Local Database State
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)

  // CSE API State for Autocomplete
  const [cseSectors, setCseSectors] = useState<any[]>([])
  const [fetchingCse, setFetchingCse] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

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

  // Ref for clicking outside the dropdown
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setShowDropdown(false)
      setNewName("")
      return
    }
    
    setLoading(true)
    sectorsApi.getAll()
      .then(res => setSectors(res.data))
      .catch(() => console.error("Failed to fetch sectors"))
      .finally(() => setLoading(false))
  }, [open])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Lazy load CSE sectors only when the user interacts with the input
  const loadCseSectors = async () => {
    if (cseSectors.length > 0) return // Already loaded
    
    setFetchingCse(true)
    try {
      const res = await fetch("/api/cse/sectors")
      const data = await res.json()
      if (Array.isArray(data)) {
        setCseSectors(data)
      }
    } catch (e) {
      console.error("Failed to load CSE sectors", e)
    } finally {
      setFetchingCse(false)
    }
  }

  // Extract the sector name securely based on CSE's object structure
  const getCseSectorName = (s: any) => {
    if (typeof s === "string") return s
    return s.name || s.sectorName || s.sectorCode || ""
  }

  // Filter CSE sectors locally as the user types
  const filteredCseSectors = cseSectors.filter(s => {
    const name = getCseSectorName(s)
    return name.toLowerCase().includes(newName.toLowerCase())
  })

  const handleSelectCseSector = (name: string) => {
    setNewName(name)
    setShowDropdown(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) { setAddError("Name is required."); return }
    
    // Prevent duplicate entries
    if (sectors.find(s => s.name.toLowerCase() === newName.trim().toLowerCase())) {
      setAddError("This sector already exists in your database.")
      return
    }

    try {
      setAddLoading(true)
      setAddError(null)
      const res = await sectorsApi.create({ name: newName.trim() })
      setSectors(prev => [...prev, res.data])
      setNewName("")
      setShowDropdown(false)
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
        <DialogContent className="sm:max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle>Manage Sectors</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            
            {/* Add new sector with CSE Autocomplete */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <Label className="text-xs">Add New Sector</Label>
              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search CSE sectors or type custom..."
                    value={newName}
                    onChange={e => { 
                      setNewName(e.target.value)
                      setAddError(null)
                      setShowDropdown(true)
                    }}
                    onFocus={() => {
                      setShowDropdown(true)
                      loadCseSectors()
                    }}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="h-9 w-full"
                  />
                  {fetchingCse && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                <Button size="sm" onClick={handleAdd} disabled={addLoading} className="shrink-0">
                  {addLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {/* CSE Dropdown List */}
              {showDropdown && (newName || cseSectors.length > 0) && (
                <div className="absolute z-50 w-[calc(100%-48px)] mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCseSectors.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center py-4">No matching CSE sectors.</div>
                  ) : (
                    filteredCseSectors.map((s, idx) => {
                      const name = getCseSectorName(s)
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectCseSector(name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                          {name}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
              {addError && <p className="text-xs text-destructive">{addError}</p>}
            </div>

            {/* Existing sectors list */}
            <div className="space-y-1.5">
              <Label className="text-xs">Existing Database Sectors</Label>

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
                              <span className="text-sm font-medium">{sector.name}</span>
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

// export function AddCompanyDialog({
//   open,
//   onClose,
//   onAdded,
// }: {
//   open: boolean
//   onClose: () => void
//   onAdded: (company: InvestmentCompany) => void
// }) {
//   const [sectors, setSectors] = useState<Sector[]>([])
//   const [loadingSectors, setLoadingSectors] = useState(true)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const [form, setForm] = useState<InvestmentCompanyRequest>({
//     symbol: "",
//     name: "",
//     isSp20: false,
//     currentPrice: 0,
//     sectorId: 0,
//   })

//   useEffect(() => {
//     if (!open) return
//     setLoadingSectors(true)
//     sectorsApi.getAll()
//       .then(res => {
//         setSectors(res.data)
//         if (res.data.length > 0) {
//           setForm(prev => ({ ...prev, sectorId: res.data[0].id }))
//         }
//       })
//       .catch(() => setError("Failed to load sectors."))
//       .finally(() => setLoadingSectors(false))
//   }, [open])

//   const handleSubmit = async () => {
//     if (!form.symbol.trim()) { setError("Symbol is required."); return }
//     if (!form.name.trim()) { setError("Name is required."); return }
//     if (!form.sectorId) { setError("Please select a sector."); return }

//     try {
//       setLoading(true)
//       setError(null)
//       const res = await investmentCompaniesApi.create(form)
//       onAdded(res.data)
//       onClose()
//       setForm({ symbol: "", name: "", isSp20: false, currentPrice: 0, sectorId: sectors[0]?.id ?? 0 })
//     } catch {
//       setError("Failed to add company. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add Company</DialogTitle>
//         </DialogHeader>

//         {loadingSectors ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
//           </div>
//         ) : (
//           <div className="space-y-4 py-2">

//             {/* Symbol + Name side by side */}
//             <div className="flex gap-3">
//               <div className="space-y-1.5 w-28">
//                 <Label htmlFor="symbol">Symbol</Label>
//                 <Input
//                   id="symbol"
//                   placeholder="e.g. JKH"
//                   value={form.symbol}
//                   onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
//                 />
//               </div>
//               <div className="space-y-1.5 flex-1">
//                 <Label htmlFor="name">Company Name</Label>
//                 <Input
//                   id="name"
//                   placeholder="e.g. John Keells Holdings"
//                   value={form.name}
//                   onChange={e => setForm({ ...form, name: e.target.value })}
//                 />
//               </div>
//             </div>

//             {/* Current Price */}
//             <div className="space-y-1.5">
//               <Label htmlFor="price">Current Price (LKR)</Label>
//               <Input
//                 id="price"
//                 type="number"
//                 placeholder="0.00"
//                 value={form.currentPrice || ""}
//                 onChange={e => setForm({ ...form, currentPrice: Number(e.target.value) })}
//               />
//             </div>

//             {/* Sector */}
//             <div className="space-y-1.5">
//               <Label>Sector</Label>
//               <Select
//                 value={String(form.sectorId)}
//                 onValueChange={v => setForm({ ...form, sectorId: Number(v) })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select sector" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {sectors.map(s => (
//                     <SelectItem key={s.id} value={String(s.id)}>
//                       {s.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* S&P 20 toggle */}
//             <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
//               <div>
//                 <p className="text-sm font-medium">S&P 20</p>
//                 <p className="text-xs text-muted-foreground">Is this company in the S&P 20 index?</p>
//               </div>
//               <Switch
//                 checked={form.isSp20}
//                 onCheckedChange={v => setForm({ ...form, isSp20: v })}
//               />
//             </div>

//             {error && <p className="text-sm text-destructive">{error}</p>}
//           </div>
//         )}

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button onClick={handleSubmit} disabled={loading || loadingSectors}>
//             {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//             Add Company
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }




// Ensure these types map to your actual definitions

interface CseCompany {
  symbol: string
  name: string
  currentPrice: number
  isSp20: boolean
}

export function AddCompanyDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (company: any) => void // Replace 'any' with InvestmentCompany
}) {
  const [sectors, setSectors] = useState<any[]>([]) // Replace 'any' with Sector
  const [loadingSectors, setLoadingSectors] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // CSE Company State
  const [cseCompanies, setCseCompanies] = useState<CseCompany[]>([])
  const [companySearch, setCompanySearch] = useState("")
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  
  // Sector State
  const [sectorSearch, setSectorSearch] = useState("")
  const [showSectorDropdown, setShowSectorDropdown] = useState(false)
  const [lookingUpSector, setLookingUpSector] = useState(false)
  const [pendingNewSectorName, setPendingNewSectorName] = useState<string | null>(null)

  const [form, setForm] = useState({
    symbol: "",
    name: "",
    isSp20: false,
    currentPrice: 0,
    sectorId: 0,
  })

  // Refs for closing dropdowns when clicking outside
  const companyRef = useRef<HTMLDivElement>(null)
  const sectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoadingSectors(true)
    
    // Fetch Local Sectors
    sectorsApi.getAll()
      .then(res => setSectors(res.data))
      .catch(() => setError("Failed to load sectors."))
      .finally(() => setLoadingSectors(false))

    // Fetch CSE Universe
    fetch("/api/cse/companies")
      .then(res => res.json())
      .then((data: CseCompany[]) => {
        if (Array.isArray(data)) setCseCompanies(data)
      })
      .catch(() => console.error("Failed to load CSE company list"))
  }, [open])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) setShowCompanyDropdown(false)
      if (sectorRef.current && !sectorRef.current.contains(event.target as Node)) setShowSectorDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter logic
  const filteredCompanies = cseCompanies.filter(c => 
    c.symbol.toLowerCase().includes(companySearch.toLowerCase()) || 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  ).slice(0, 50) // Limit to 50 for performance

  const filteredSectors = sectors.filter(s => 
    s.name.toLowerCase().includes(sectorSearch.toLowerCase())
  )

  const handleSelectCompany = async (comp: CseCompany) => {
    setForm(prev => ({
      ...prev,
      symbol: comp.symbol,
      name: comp.name,
      currentPrice: comp.currentPrice,
      isSp20: comp.isSp20,
    }))
    setCompanySearch(`${comp.symbol} - ${comp.name}`)
    setShowCompanyDropdown(false)

    // Automatically lookup sector
    setLookingUpSector(true)
    try {
      const res = await fetch(`/api/cse/company-info?symbol=${encodeURIComponent(comp.symbol)}`)
      const data = await res.json()

      if (data.sectorName) {
        const existing = sectors.find(s => s.name.toLowerCase().trim() === data.sectorName.toLowerCase().trim())
        if (existing) {
          setForm(prev => ({ ...prev, sectorId: existing.id }))
          setSectorSearch(existing.name)
          setPendingNewSectorName(null)
        } else {
          setForm(prev => ({ ...prev, sectorId: 0 }))
          setSectorSearch(data.sectorName)
          setPendingNewSectorName(data.sectorName)
        }
      }
    } catch (e) {
      console.error("Failed to fetch sector for symbol", e)
    } finally {
      setLookingUpSector(false)
    }
  }

  const handleSelectSector = (id: number, name: string) => {
    setForm(prev => ({ ...prev, sectorId: id }))
    setSectorSearch(name)
    setPendingNewSectorName(null)
    setShowSectorDropdown(false)
  }

  const handleSectorSearchChange = (val: string) => {
    setSectorSearch(val)
    setShowSectorDropdown(true)
    setForm(prev => ({ ...prev, sectorId: 0 }))
    setPendingNewSectorName(val.trim() || null)
  }

  const handleSubmit = async () => {
    if (!form.symbol.trim()) { setError("Symbol is required."); return }
    if (!form.name.trim()) { setError("Name is required."); return }
    if (!form.sectorId && !pendingNewSectorName) { setError("Please select or type a sector."); return }

    try {
      setLoading(true)
      setError(null)
      let finalSectorId = form.sectorId

      // 1. Create sector if it doesn't exist
      if (!finalSectorId && pendingNewSectorName) {
        const sectorRes = await sectorsApi.create({ name: pendingNewSectorName })
        finalSectorId = sectorRes.data.id
        setSectors(prev => [...prev, sectorRes.data])
      }

      // 2. Create the company using the resolved sector ID
      const res = await investmentCompaniesApi.create({ ...form, sectorId: finalSectorId })
      
      onAdded(res.data)
      onClose()
      
      // Reset state
      setForm({ symbol: "", name: "", isSp20: false, currentPrice: 0, sectorId: 0 })
      setCompanySearch("")
      setSectorSearch("")
      setPendingNewSectorName(null)
    } catch {
      setError("Failed to add company. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>

        {loadingSectors ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            
            {/* Searchable Company Dropdown */}
            <div className="space-y-1.5 relative" ref={companyRef}>
              <Label>Search Company</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type symbol or name (e.g. JKH)"
                  className="pl-9"
                  value={companySearch}
                  onChange={e => {
                    setCompanySearch(e.target.value)
                    setShowCompanyDropdown(true)
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                />
              </div>
              
              {showCompanyDropdown && companySearch && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center">No companies found.</div>
                  ) : (
                    filteredCompanies.map(c => (
                      <button
                        key={c.symbol}
                        onClick={() => handleSelectCompany(c)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex justify-between items-center transition-colors"
                      >
                        <span className="font-medium">{c.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate ml-2">{c.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
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

            {/* Searchable Sector Dropdown */}
            <div className="space-y-1.5 relative" ref={sectorRef}>
              <Label>Sector</Label>
              <div className="relative">
                <Input
                  placeholder="Select or type to create new..."
                  value={sectorSearch}
                  onChange={e => handleSectorSearchChange(e.target.value)}
                  onFocus={() => setShowSectorDropdown(true)}
                  disabled={lookingUpSector}
                />
                {lookingUpSector && (
                  <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {showSectorDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredSectors.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSector(s.id, s.name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex justify-between items-center transition-colors"
                    >
                      {s.name}
                      {form.sectorId === s.id && <Check className="h-3 w-3 text-primary" />}
                    </button>
                  ))}
                  
                  {/* Create New Sector Option */}
                  {sectorSearch && !filteredSectors.find(s => s.name.toLowerCase() === sectorSearch.toLowerCase()) && (
                    <button
                      onClick={() => {
                        setForm(prev => ({ ...prev, sectorId: 0 }))
                        setPendingNewSectorName(sectorSearch)
                        setShowSectorDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 text-primary transition-colors border-t border-border"
                    >
                      Create "{sectorSearch}"
                    </button>
                  )}
                </div>
              )}
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
            Save Data
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