"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Landmark, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { accountsApi, Account } from "@/lib/api/accounts"
import { AddAccountDialog, UpdateAccountDialog } from "@/components/accounts/AddDialogs"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

// Dynamic card gradients
const cardGradients = [
  "from-blue-500 to-cyan-400",
  "from-purple-500 to-pink-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-indigo-500 to-violet-400",
]

const BanksPage = () => {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [accountToUpdate, setAccountToUpdate] = useState<Account | null>(null)

  useEffect(() => {
    accountsApi.getAll()
      .then(res => setAccounts(res.data.filter(a => a.type === "Bank")))
      .catch(() => console.error("Failed to fetch accounts"))
      .finally(() => setLoading(false))
  }, [])

  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0)

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1200px" }}>
      
      {/* --- EXACT ORIGINAL HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bank Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total balance:{" "}
            <span className="font-semibold text-foreground">{fmt(totalBalance)}</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Bank Account
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No bank accounts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account, index) => {
            const gradient = cardGradients[index % cardGradients.length]

            return (
              <Card 
                key={account.id} 
                className="group relative overflow-hidden border-border/50 hover:border-transparent hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push(`/banks/${account.id}`)}
              >
                {/* Glowing top line effect */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-linear-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
                
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${gradient} text-white shadow-sm`}>
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 z-10">
                      {/* Edit Button with stopPropagation */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/50 hover:bg-secondary"
                        onClick={(e) => {
                          e.stopPropagation() // Stops the click from triggering the card routing
                          setAccountToUpdate(account)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-xl font-semibold mt-0.5">{fmt(account.currentBalance)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* --- EXACT ORIGINAL DIALOGS --- */}
      <AddAccountDialog
        open={showAdd}
        type="Bank"
        onClose={() => setShowAdd(false)}
        onAdded={account => setAccounts(prev => [...prev, account])}
      />

      <UpdateAccountDialog
        open={!!accountToUpdate}
        account={accountToUpdate}
        onClose={() => setAccountToUpdate(null)}
        onUpdated={updated => setAccounts(prev =>
          prev.map(a => a.id === updated.id ? updated : a)
        )}
      />
    </div>
  )
}

export default BanksPage