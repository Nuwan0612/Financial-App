"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { incomesApi, Income, IncomeEntry } from "@/lib/api/income"
import { CURRENT_YEAR, getAvailableYears, MONTHS, totalForMonth, totalForYear } from "@/components/finances/income/entries/helperFunctions"
import { MonthCalendar } from "@/components/finances/income/entries/Calender"

const fmt = (n: number, currency = "LKR") =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)


const IncomeDetailPage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [income, setIncome] = useState<Income | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    incomesApi.getById(Number(id))
      .then(res => setIncome(res.data))
      .catch(() => console.error("Failed to fetch income"))
      .finally(() => setLoading(false))
  }, [id])

  const handleEntryAdded = (entry: IncomeEntry) => {
    if (!income) return
    setIncome({ ...income, incomeEntries: [...income.incomeEntries, entry] })
  }
  const handleEntryUpdated = (updated: IncomeEntry) => {
    if (!income) return
    setIncome({
      ...income,
      incomeEntries: income.incomeEntries.map(e => e.id === updated.id ? updated : e)
    })
  }
  const handleEntryDeleted = (id: number) => {
    if (!income) return
    setIncome({
      ...income,
      incomeEntries: income.incomeEntries.filter(e => e.id !== id)
    })
  }

  const entries = income?.incomeEntries ?? []
  const years = getAvailableYears(entries)
  const yearTotal = totalForYear(entries, selectedYear)
  const monthTotal = totalForMonth(entries, selectedYear, selectedMonth)

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1200px" }}>

      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Finances
      </Button>

      {/* Header card */}
      {loading ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : income ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">{income.name}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Income tracker</p>
                </div>
                <Badge variant="secondary">{income.currency}</Badge>
              </div>
              <div className="flex gap-8 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Expected Monthly</p>
                  <p className="text-lg font-semibold">{fmt(income.expectedAmount, income.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">This Year ({selectedYear})</p>
                  <p className="text-lg font-semibold text-green-600">{fmt(yearTotal, income.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{MONTHS[selectedMonth]} {selectedYear}</p>
                  <p className="text-lg font-semibold text-green-600">{fmt(monthTotal, income.currency)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Income not found.</p>
      )}

      {!loading && income && (
        <div className="grid grid-cols-[280px_1fr] gap-6">

          {/* Left panel */}
          <div className="space-y-4">

            {/* Year selector */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Year
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                      ${selectedYear === year ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}
                    `}
                  >
                    <span>{year}</span>
                    <span className={`text-xs ${selectedYear === year ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {fmt(totalForYear(entries, year), income.currency)}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Month selector */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Month — {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((m, idx) => {
                    const mTotal = totalForMonth(entries, selectedYear, idx)
                    return (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(idx)}
                        className={`
                          flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-colors
                          ${selectedMonth === idx ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}
                        `}
                      >
                        <span>{m}</span>
                        {mTotal > 0 && (
                          <span className={`text-[10px] mt-0.5 ${selectedMonth === idx ? "text-primary-foreground/70" : "text-green-600"}`}>
                            {new Intl.NumberFormat("en-LK", { notation: "compact", maximumFractionDigits: 0 }).format(mTotal)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Calendar */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {MONTHS[selectedMonth]} {selectedYear}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-green-600">{fmt(monthTotal, income.currency)}</span>
                  </span>
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
                entries={entries}
                currency={income.currency}
                incomeId={income.id}
                onEntryAdded={handleEntryAdded}
                onEntryUpdated={handleEntryUpdated}
                onEntryDeleted={handleEntryDeleted}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default IncomeDetailPage