"use client"


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import IncomeTable from "@/components/finances/income/IncomeTable"
import LiabilitiesTable from "@/components/finances/liabilities/LiabilitiesTable"
import ExpensesTable from "@/components/finances/expenses/ExpencesTable"



const FinancesPage = () => {



  return (
    <div className="p-2 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finances</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your income sources, fixed expenses, and liabilities.
        </p>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>

        {/* ── INCOME TAB ── */}
        <IncomeTable />

        {/* ── EXPENSES TAB ── */}
        <ExpensesTable />

        {/* ── LIABILITIES TAB ── */}
        <LiabilitiesTable />
        
      </Tabs>
    </div>
  )
}

export default FinancesPage