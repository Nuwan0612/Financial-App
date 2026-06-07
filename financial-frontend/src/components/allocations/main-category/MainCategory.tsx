
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { MainCategory, mainCategoryApi } from "@/lib/api/allocations"
import { AddMainCategoryDialog, UpdateMainCategoryDialog } from "./AddDialogs"
import { DeleteMainCategoryDialog } from "./AlertDialogs"

const MainCategoryTable = () => {

  const [mainCategories, setMainCategories] = useState<MainCategory[]>([])
  const [mainCategoryToDelete, setMainCategoryToDelete] = useState<number | null>(null)
  const [mainCategoryToUpdate, setMainCategoryToUpdate] = useState<MainCategory | null>(null)

  const [showAddMainCategory, setShowAddMainCategory] = useState(false)  
  const [showUpdateMainCategory, setShowUpdateMainCategory] = useState(false) 
  const [showDelete, setShowDelete] = useState(false)  

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await mainCategoryApi.getAll()
        setMainCategories(res.data)
      } catch {
        console.error("Failed to fetch main categories")
      }
    }
    fetchMainCategories()
  }, [])
         
    const handleMainCategoryAdded = (mainCategory: MainCategory) => {
      setMainCategories((prev) => [...prev, mainCategory])
    }
  
    const handleMainCategoryUpdated = (updated: MainCategory) => {
      setMainCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
    }
  
    const handleMainCategoryDeleted = (id: number) => {
      setMainCategories((prev) => prev.filter((item) => item.id !== id))
    }

  return(
    <div>
      <TabsContent value="main" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Main Categories</h2>
          <Button size="sm" onClick={() => setShowAddMainCategory(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Main Category
          </Button>
        </div>

        {mainCategories.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No main categories found.</p>
            <p className="text-muted-foreground text-xs mt-1">Click "Add Main Category" to get started.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                    Name
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mainCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 border border-border">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setShowUpdateMainCategory(true); setMainCategoryToUpdate(item) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { setShowDelete(true); setMainCategoryToDelete(item.id) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <AddMainCategoryDialog 
        open={showAddMainCategory} 
        onClose={() => setShowAddMainCategory(false)} 
        onAdded={handleMainCategoryAdded} 
      />

      <UpdateMainCategoryDialog
        open={showUpdateMainCategory}
        updateItem={mainCategoryToUpdate}
        onClose={() => setShowUpdateMainCategory(false)}
        onUpdated={handleMainCategoryUpdated}
      />

      <DeleteMainCategoryDialog
        open={showDelete}
        mainCategoryId={mainCategoryToDelete}
        mainCategoryName={
          mainCategories.find(m => m.id === mainCategoryToDelete)?.name ?? ""
        }
        onConfirm={(id) => {
          handleMainCategoryDeleted(id)
          setMainCategoryToDelete(null)
          setShowDelete(false)
        }}
        onCancel={() => {
          setShowDelete(false)
        }}
      />
    </div>
  )
}

export default MainCategoryTable;