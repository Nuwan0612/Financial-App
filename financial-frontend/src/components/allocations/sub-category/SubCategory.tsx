
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { SubCategory, subCategoryApi } from "@/lib/api/allocations"
import { AddSubCategoryDialog, UpdateSubCategoryDialog } from "./AddDialogs"
import { DeleteSubCategoryDialog } from "./AlertDialogs"


const SubCategoryTable = () => {

  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<number | null>(null)
  const [subCategoryToUpdate, setSubCategoryToUpdate] = useState<SubCategory | null>(null)

  const [showAddSubCategory, setShowAddSubCategory] = useState(false)  
  const [showUpdateSubCategory, setShowUpdateSubCategory] = useState(false) 
  const [showDelete, setShowDelete] = useState(false)  
  

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await subCategoryApi.getAll()
        setSubCategories(res.data)
      } catch {
        console.error("Failed to fetch sub categories")
      }
    }
    fetchSubCategories()
  }, [])
         
    const handleSubCategoryAdded = (subCategory: SubCategory) => {
      setSubCategories((prev) => [...prev, subCategory])
    }
  
    const handleSubCategoryUpdated = (updated: SubCategory) => {
      setSubCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
    }
  
    const handleSubCategoryDeleted = (id: number) => {
      setSubCategories((prev) => prev.filter((item) => item.id !== id))
    }

  return(
    <div>
      <TabsContent value="sub" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Sub Categories</h2>
          <Button size="sm" onClick={() => setShowAddSubCategory(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Sub Category
          </Button>
        </div>

        {subCategories.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No sub categories found.</p>
            <p className="text-muted-foreground text-xs mt-1">Click "Add Sub Category" to get started.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                    Main Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                  Sub Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                  Percentage
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                  Account
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 border border-border font-medium">
                    {item.mainCategoryName}
                  </td>
                  <td className="px-4 py-3 border border-border font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 border border-border font-medium text-center">
                    {item.percentage}%
                  </td>
                  <td className="px-4 py-3 border border-border font-medium">
                    {item.accountName}
                  </td>
                  <td className="px-4 py-3 border border-border">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => { setShowUpdateSubCategory(true); setSubCategoryToUpdate(item) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => { setShowDelete(true); setSubCategoryToDelete(item.id) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="px-4 py-3 border border-border text-center font-medium ">
                  Toatal
                </td>
                <td colSpan={1} className="px-4 py-3 border bg-muted border-border text-center font-medium">
                  {subCategories.reduce((sum, item) => sum + item.percentage, 0)}%
                </td>
                
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </TabsContent>

      <AddSubCategoryDialog 
        open={showAddSubCategory} 
        onClose={() => setShowAddSubCategory(false)} 
        onAdded={handleSubCategoryAdded} 
      />

      <UpdateSubCategoryDialog
        open={showUpdateSubCategory}
        updateItem={subCategoryToUpdate}
        onClose={() => setShowUpdateSubCategory(false)}
        onUpdated={handleSubCategoryUpdated}
      />

      <DeleteSubCategoryDialog
        open={showDelete}
        subCategoryId={subCategoryToDelete}
        subCategoryName={
          subCategories.find(s => s.id === subCategoryToDelete)?.name ?? ""
        }
        onConfirm={(id) => {
          handleSubCategoryDeleted(id)
          setSubCategoryToDelete(null)
          setShowDelete(false)
        }}
        onCancel={() => {
          setShowDelete(false)
          setSubCategoryToDelete(null)
        }}
      />
    </div>
  )
}

export default SubCategoryTable;