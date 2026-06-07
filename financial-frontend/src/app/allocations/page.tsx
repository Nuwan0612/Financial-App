"use client"


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubCategoryTable from "@/components/allocations/sub-category/SubCategory"
import MainCategoryTable from "@/components/allocations/main-category/MainCategory"

const AllocationsPage = () => {
  return (
    <div className="p-2 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Allocations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define percentage-based rules to distribute your incoming cash flow.
        </p>
      </div>

      <Tabs defaultValue="main">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="main">Main Categories</TabsTrigger>
          <TabsTrigger value="sub">Sub Categories</TabsTrigger>
        </TabsList>

        {/* ── MAIN CATEGORIES TAB ── */}
        <MainCategoryTable />

        {/* ── SUB CATEGORIES TAB ── */}
        <SubCategoryTable />

      </Tabs>
    </div>
  )
}

export default AllocationsPage