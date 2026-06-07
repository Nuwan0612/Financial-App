// src/app/daily-logs/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { dailyLogApi, DailyLog, DailyLogDto } from "@/lib/api/dailyLogs"
import { accountsApi, Account, Bukets, bucketsApi } from "@/lib/api/accounts"
import { subCategoryApi, SubCategory } from "@/lib/api/allocations"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ─── Types ───────────────────────────────────────────────────
type LogRow = {
  id: string
  description: string
  amount: number
  bucketId: number | null
  accountId: number | null  // ← derived from bucket selection
}

type ValidationError = {
  rowIndex: number
  message: string
}

// ─── Constants ───────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const CURRENT_YEAR = new Date().getFullYear()
const PAGE_SIZE = 10

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
function logsForDate(logs: DailyLog[], year: number, month: number, day: number) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return logs.filter(l => l.date === dateStr)
}
function totalForMonth(logs: DailyLog[], year: number, month: number) {
  return logs.filter(l => {
    const d = new Date(l.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}
function getAvailableYears() {
  return Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - 1 + i)
}
function makeEmptyRow(): LogRow {
  return { id: Math.random().toString(36).slice(2), description: "", amount: 0, bucketId: null, accountId: null }
}
function makeDefaultRows(count = 3): LogRow[] {
  return Array.from({ length: count }, makeEmptyRow)
}

// ─── Log Entry Dialog ─────────────────────────────────────────
function LogEntryDialog({
  open, date, accounts, buckets,
  onClose, onSaved,
}: {
  open: boolean
  date: string
  accounts: Account[]
  buckets: Bukets[]  
  onClose: () => void
  onSaved: (logs: DailyLog[]) => void
}) {
  const [tab, setTab] = useState<"EXPENSE" | "INCOME">("EXPENSE")
  const [expenseRows, setExpenseRows] = useState<LogRow[]>(makeDefaultRows())
  const [incomeRows, setIncomeRows] = useState<LogRow[]>(makeDefaultRows())
  const [expenseAccountId, setExpenseAccountId] = useState<number>(accounts[0]?.id ?? 0)
  const [incomeAccountId, setIncomeAccountId] = useState<number>(accounts[0]?.id ?? 0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setExpenseRows(makeDefaultRows())
      setIncomeRows(makeDefaultRows())
      setErrors([])
      setApiError(null)
      if (accounts.length > 0) {
        setExpenseAccountId(accounts[0].id)
        setIncomeAccountId(accounts[0].id)
      }
    }
  }, [open, accounts])

  const currentRows = tab === "EXPENSE" ? expenseRows : incomeRows
  const setCurrentRows = tab === "EXPENSE" ? setExpenseRows : setIncomeRows
  const currentAccountId = tab === "EXPENSE" ? expenseAccountId : incomeAccountId
  const setCurrentAccountId = tab === "EXPENSE" ? setExpenseAccountId : setIncomeAccountId

  const updateRow = (id: string, field: keyof LogRow, value: any) => {
    setCurrentRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const addRow = () => setCurrentRows(prev => [...prev, makeEmptyRow()])

  const removeRow = (id: string) => {
    setCurrentRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }

  // Frontend validation
  const validate = (rows: LogRow[], type: "EXPENSE" | "INCOME"): ValidationError[] => {
    const errs: ValidationError[] = []
    const filledRows = rows.filter(r => r.description || r.amount)

    filledRows.forEach((row, idx) => {
      if (!row.description) {
        errs.push({ rowIndex: idx, message: `Row ${idx + 1}: Description is required.` })
      }
      if (!row.amount || row.amount <= 0) {
        errs.push({ rowIndex: idx, message: `Row ${idx + 1}: Amount must be greater than 0.` })
      }
      // ← Now this actually works
      if (type === "EXPENSE" && row.bucketId) {
        const bucket = buckets.find(b => b.id === row.bucketId)
        if (bucket && bucket.currentAmount < row.amount) {
          errs.push({
            rowIndex: idx,
            message: `Row ${idx + 1}: Insufficient funds in "${bucket.name}". Available: ${fmt(bucket.currentAmount)}, Requested: ${fmt(row.amount)}`
          })
        }
      }
    })

    return errs
  }

  const handleSave = async () => {
    const rows = tab === "EXPENSE" ? expenseRows : incomeRows
    const filledRows = rows.filter(r => r.description || r.amount > 0)

    if (filledRows.length === 0) {
      setApiError("Please fill in at least one row.")
      return
    }

    const validationErrors = validate(filledRows, tab)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Validate each row has an account
    const missingAccount = filledRows.find(r => !r.accountId && !r.bucketId)
    if (missingAccount) {
      setApiError("Please select a bucket for each row — it determines the account automatically.")
      return
    }

    try {
      setLoading(true)
      setErrors([])
      setApiError(null)

      const dtos: DailyLogDto[] = filledRows.map(row => ({
        date,
        description: row.description,
        amount: row.amount,
        type: tab,
        accountId: row.accountId!,   // ← from bucket
        bucketId: row.bucketId,
      }))

      // console.log("Saving logs:", dtos)
      // const results = await Promise.all(dtos.map(dto => dailyLogApi.create(dto)))
      // onSaved(results.map(r => r.data))
      const res = await dailyLogApi.createBulk(dtos)
      onSaved(res.data)
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save. Please try again."
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const tabContent = (type: "EXPENSE" | "INCOME") => {
  const rows = type === "EXPENSE" ? expenseRows : incomeRows
  const setRows = type === "EXPENSE" ? setExpenseRows : setIncomeRows

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">
                Description
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-32">
                Amount
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-48">
                Bucket
              </th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-32">
                Account
              </th>
              <th className="border border-border w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              // Derive account name from selected bucket
              const selectedBucket = buckets.find(b => b.id === row.bucketId)

              return (
                <tr key={row.id}>
                  <td className="px-2 py-1.5 border border-border">
                    <Input
                      placeholder="e.g. Groceries"
                      value={row.description}
                      onChange={e => {
                        setRows(prev => prev.map(r => r.id === row.id ? { ...r, description: e.target.value } : r))
                      }}
                      className="h-8 text-xs border-0 shadow-none focus-visible:ring-0"
                    />
                  </td>
                  <td className="px-2 py-1.5 border border-border">
                    <Input
                      type="number"
                      placeholder="0"
                      value={row.amount || ""}
                      onChange={e => {
                        setRows(prev => prev.map(r => r.id === row.id ? { ...r, amount: Number(e.target.value) } : r))
                      }}
                      className="h-8 text-xs border-0 shadow-none focus-visible:ring-0"
                    />
                  </td>
                  <td className="px-2 py-1.5 border border-border">
                    <Select
                      value={row.bucketId ? String(row.bucketId) : "none"}
                      onValueChange={v => {
                        const bucketId = v === "none" ? null : Number(v)
                        const bucket = buckets.find(b => b.id === bucketId)
                        setRows(prev => prev.map(r => r.id === row.id
                          ? { ...r, bucketId, accountId: bucket?.accountId ?? null }
                          : r
                        ))
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select bucket" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No bucket</SelectItem>
                        {buckets.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name}
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({b.subCategoryName})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {/* Account auto-shown based on bucket */}
                  <td className="px-3 py-1.5 border border-border text-xs text-muted-foreground">
                    {selectedBucket ? selectedBucket.accountName : "—"}
                  </td>
                  <td className="px-2 py-1.5 border border-border text-center">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== row.id) : prev)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Button
        variant="outline" size="sm" className="gap-1.5"
        onClick={() => setRows(prev => [...prev, makeEmptyRow()])}
      >
        <Plus className="h-3 w-3" /> Add Row
      </Button>
    </div>
  )
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Entries — {date}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => { setTab(v as any); setErrors([]); setApiError(null) }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="EXPENSE">Expenses</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="EXPENSE" className="mt-4">
            {tabContent("EXPENSE")}
          </TabsContent>
          <TabsContent value="INCOME" className="mt-4">
            {tabContent("INCOME")}
          </TabsContent>
        </Tabs>

        {/* Validation errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((e, i) => <li key={i} className="text-xs">{e.message}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* API error */}
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{apiError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save {tab === "EXPENSE" ? "Expenses" : "Income"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Calendar ─────────────────────────────────────────────────
// function MonthCalendar({
//   year, month, logs,
//   onDayClick,
// }: {
//   year: number
//   month: number
//   logs: DailyLog[]
//   onDayClick: (date: string) => void
// }) {
//   const daysInMonth = getDaysInMonth(year, month)
//   const firstDay = getFirstDayOfMonth(year, month)
//   const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
//   const blanks = Array.from({ length: firstDay }, (_, i) => i)

//   return (
//     <div>
//       <div className="grid grid-cols-7 mb-1">
//         {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
//           <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
//         ))}
//       </div>
//       <div className="grid grid-cols-7 gap-1">
//         {blanks.map(b => <div key={`b-${b}`} />)}
//         {days.map(day => {
//           const dayLogs = logsForDate(logs, year, month, day)
//           const expenses = dayLogs.filter(l => l.type === "EXPENSE")
//           const incomes = dayLogs.filter(l => l.type === "INCOME")
//           const isToday = new Date().getFullYear() === year &&
//             new Date().getMonth() === month && new Date().getDate() === day
//           const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

//           return (
//             <button
//               key={day}
//               onClick={() => onDayClick(dateStr)}
//               className={`
//                 flex flex-col items-center justify-start p-1.5 rounded-lg text-xs
//                 min-h-[60px] border transition-colors
//                 border-transparent hover:border-border hover:bg-muted/30
//               `}
//             >
//               <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
//                 ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
//                 {day}
//               </span>
//               {incomes.length > 0 && (
//                 <span className="text-[9px] text-green-600 font-medium mt-0.5 truncate w-full text-center">
//                   +{fmt(incomes.reduce((s, l) => s + l.amount, 0))}
//                 </span>
//               )}
//               {expenses.length > 0 && (
//                 <span className="text-[9px] text-destructive font-medium truncate w-full text-center">
//                   -{fmt(expenses.reduce((s, l) => s + l.amount, 0))}
//                 </span>
//               )}
//             </button>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

function MonthCalendar({
  year, month, logs, selectedDate,
  onDayClick, onDayDoubleClick,
}: {
  year: number
  month: number
  logs: DailyLog[]
  selectedDate: string | null
  onDayClick: (date: string) => void
  onDayDoubleClick: (date: string) => void
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(day => {
          const dayLogs = logsForDate(logs, year, month, day)
          const expenses = dayLogs.filter(l => l.type === "EXPENSE")
          const incomes = dayLogs.filter(l => l.type === "INCOME")
          const isToday = new Date().getFullYear() === year &&
            new Date().getMonth() === month && new Date().getDate() === day
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isSelected = selectedDate === dateStr   // ← highlight selected

          return (
            <button
              key={day}
              onClick={() => onDayClick(dateStr)}
              onDoubleClick={() => onDayDoubleClick(dateStr)}   // ← double click
              className={`
                flex flex-col items-center justify-start p-1.5 rounded-lg text-xs
                min-h-15 border transition-colors
                ${isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border hover:bg-muted/30"}
              `}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                {day}
              </span>
              {incomes.length > 0 && (
                <span className="text-[9px] text-green-600 font-medium mt-0.5 truncate w-full text-center">
                  +{fmt(incomes.reduce((s, l) => s + l.amount, 0))}
                </span>
              )}
              {expenses.length > 0 && (
                <span className="text-[9px] text-destructive font-medium truncate w-full text-center">
                  -{fmt(expenses.reduce((s, l) => s + l.amount, 0))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
const DailyLogsPage = () => {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [buckets, setBuckets] = useState<Bukets[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([
      dailyLogApi.getAll(),
      accountsApi.getAll(),
      bucketsApi.getAll(),
    ]).then(([logsRes, accountsRes, bucketsRes]) => {
      setLogs(logsRes.data)
      setAccounts(accountsRes.data)
      setBuckets(bucketsRes.data)
    }).catch(() => console.error("Failed to fetch data"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [selectedMonth, selectedYear])

  // const handleDayClick = (date: string) => {
  //   setSelectedDate(date)
  //   setShowDialog(true)
  // }
  const handleDayClick = (date: string) => {
    setSelectedDate(date)
    // no setShowDialog here anymore
  }

  const handleLogsSaved = (newLogs: DailyLog[]) => {
    setLogs(prev => [...prev, ...newLogs])
  }

  const monthLogs = totalForMonth(logs, selectedYear, selectedMonth)
  const monthIncome = monthLogs.filter(l => l.type === "INCOME").reduce((s, l) => s + l.amount, 0)
  const monthExpense = monthLogs.filter(l => l.type === "EXPENSE").reduce((s, l) => s + l.amount, 0)
  const years = getAvailableYears()

  // Table — all logs for selected month, newest first
  // const sortedMonthLogs = [...monthLogs].reverse()
  const tableLogs = selectedDate
    ? logs.filter(l => l.date === selectedDate)
    : monthLogs
  const sortedMonthLogs = [...tableLogs].reverse()
  const totalPages = Math.max(1, Math.ceil(sortedMonthLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = sortedMonthLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1400px" }}>
      <div>
        <h1 className="text-2xl font-semibold">Daily Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click any date to log income or expenses.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          {/* Two panel layout */}
          <div className="grid grid-cols-[260px_1fr] gap-6">

            {/* Left — year + month */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Year
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                        ${selectedYear === year ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`}
                    >
                      <span>{year}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Month — {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((m, idx) => {
                      const mLogs = totalForMonth(logs, selectedYear, idx)
                      const mIncome = mLogs.filter(l => l.type === "INCOME").reduce((s, l) => s + l.amount, 0)
                      const mExpense = mLogs.filter(l => l.type === "EXPENSE").reduce((s, l) => s + l.amount, 0)
                      return (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(idx)}
                          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-colors
                            ${selectedMonth === idx ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`}
                        >
                          <span>{m}</span>
                          {mIncome > 0 && (
                            <span className={`text-[9px] mt-0.5 ${selectedMonth === idx ? "text-primary-foreground/70" : "text-green-600"}`}>
                              +{new Intl.NumberFormat("en-LK", { notation: "compact", maximumFractionDigits: 0 }).format(mIncome)}
                            </span>
                          )}
                          {mExpense > 0 && (
                            <span className={`text-[9px] ${selectedMonth === idx ? "text-primary-foreground/70" : "text-destructive"}`}>
                              -{new Intl.NumberFormat("en-LK", { notation: "compact", maximumFractionDigits: 0 }).format(mExpense)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right — calendar */}
            {/* <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {MONTHS[selectedMonth]} {selectedYear}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">+{fmt(monthIncome)}</span>
                    <span className="text-destructive font-medium">-{fmt(monthExpense)}</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => {
                          if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
                          else setSelectedMonth(m => m - 1)
                        }}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => {
                          if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
                          else setSelectedMonth(m => m + 1)
                        }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <MonthCalendar
                  year={selectedYear}
                  month={selectedMonth}
                  logs={logs}
                  onDayClick={handleDayClick}
                />
              </CardContent>
            </Card> */}
            {/* Right — calendar */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {MONTHS[selectedMonth]} {selectedYear}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">+{fmt(monthIncome)}</span>
                    <span className="text-destructive font-medium">-{fmt(monthExpense)}</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => {
                          if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
                          else setSelectedMonth(m => m - 1)
                        }}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => {
                          if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
                          else setSelectedMonth(m => m + 1)
                        }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* <MonthCalendar
                  year={selectedYear}
                  month={selectedMonth}
                  logs={logs}
                  selectedDate={selectedDate}        // ← pass selected date
                  onDayClick={(date) => setSelectedDate(date)}           // ← single click just sets date
                  onDayDoubleClick={(date) => { setSelectedDate(date); setShowDialog(true) }}  // ← double click opens dialog
                /> */}
                <MonthCalendar
                  year={selectedYear}
                  month={selectedMonth}
                  logs={logs}
                  selectedDate={selectedDate}
                  onDayClick={(date) => setSelectedDate(date)}
                  onDayDoubleClick={(date) => { setSelectedDate(date); setShowDialog(true) }}
                />

                {/* Date detail panel — shows below calendar on single click */}
                {/* {selectedDate && (() => {
                  const dateLogs = logs.filter(l => l.date === selectedDate)
                  const dateIncome = dateLogs.filter(l => l.type === "INCOME").reduce((s, l) => s + l.amount, 0)
                  const dateExpense = dateLogs.filter(l => l.type === "EXPENSE").reduce((s, l) => s + l.amount, 0)

                  return (
                    <div className="mt-4 border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{selectedDate}</p>
                        <div className="flex items-center gap-3">
                          {dateIncome > 0 && <span className="text-xs text-green-600 font-medium">+{fmt(dateIncome)}</span>}
                          {dateExpense > 0 && <span className="text-xs text-destructive font-medium">-{fmt(dateExpense)}</span>}
                          <Button size="sm" className="h-7 text-xs gap-1.5"
                            onClick={() => setShowDialog(true)}>
                            <Plus className="h-3 w-3" /> Add Entry
                          </Button>
                        </div>
                      </div>

                      {dateLogs.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No entries for this date. Double-click or click "Add Entry" to log.
                        </p>
                      ) : (
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">Description</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-28">Account</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-28">Bucket</th>
                              <th className="text-center px-3 py-2 font-medium text-muted-foreground border border-border w-20">Type</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground border border-border w-28">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dateLogs.map(log => (
                              <tr key={log.id} className="hover:bg-muted/20">
                                <td className="px-3 py-2 border border-border">{log.description}</td>
                                <td className="px-3 py-2 border border-border text-muted-foreground">{log.accountName}</td>
                                <td className="px-3 py-2 border border-border text-muted-foreground">{log.bucketName ?? "—"}</td>
                                <td className="px-3 py-2 border border-border text-center">
                                  {log.type === "INCOME" ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Income</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-destructive border-destructive/40 text-xs">Expense</Badge>
                                  )}
                                </td>
                                <td className={`px-3 py-2 border border-border text-right tabular-nums font-medium
                                  ${log.type === "INCOME" ? "text-green-600" : "text-destructive"}`}>
                                  {log.type === "INCOME" ? "+" : "-"}{fmt(log.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )
                })()} */}
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="space-y-3">
            {/* <h2 className="text-lg font-medium">
              {MONTHS[selectedMonth]} {selectedYear} — Log History
            </h2> */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {selectedDate
                  ? `${selectedDate} — Log History`
                  : `${MONTHS[selectedMonth]} ${selectedYear} — Log History`}
              </h2>
              {selectedDate && (
                <Button variant="outline" size="sm" className="text-xs"
                  onClick={() => setSelectedDate(null)}>
                  Show Full Month
                </Button>
              )}
            </div>


            {sortedMonthLogs.length === 0 ? (
              <div className="rounded-lg border border-border py-12 text-center">
                <p className="text-muted-foreground text-sm">No logs for this month.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Description</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-32">Account</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-32">Bucket</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-24">Type</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(log => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 border border-border text-muted-foreground text-xs">{log.date}</td>
                        <td className="px-4 py-3 border border-border font-medium">{log.description}</td>
                        <td className="px-4 py-3 border border-border text-muted-foreground text-xs">{log.accountName}</td>
                        <td className="px-4 py-3 border border-border text-muted-foreground text-xs">{log.bucketName ?? "—"}</td>
                        <td className="px-4 py-3 border border-border text-center">
                          {log.type === "INCOME" ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Income</Badge>
                          ) : (
                            <Badge variant="outline" className="text-destructive border-destructive/40 text-xs">Expense</Badge>
                          )}
                        </td>
                        <td className={`px-4 py-3 border border-border text-right tabular-nums font-medium
                          ${log.type === "INCOME" ? "text-green-600" : "text-destructive"}`}>
                          {log.type === "INCOME" ? "+" : "-"}{fmt(log.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 border-t border-border">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, sortedMonthLogs.length)}–{Math.min(safePage * PAGE_SIZE, sortedMonthLogs.length)} of {sortedMonthLogs.length}
                          </p>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-7 w-7"
                              disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium tabular-nums">
                              Page {safePage} / {totalPages}
                            </span>
                            <Button variant="outline" size="icon" className="h-7 w-7"
                              disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dialog */}
      {selectedDate && (
        <LogEntryDialog
          open={showDialog}
          date={selectedDate}
          accounts={accounts}
          buckets={buckets}           // ← changed from subCategories
          onClose={() => setShowDialog(false)}
          onSaved={handleLogsSaved}
        />
      )}
    </div>
  )
}

export default DailyLogsPage