import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types'

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose/Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
]

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onCreateCategory: (data: { name: string; color: string }) => void
  onDeleteCategory: (id: number) => void
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    onCreateCategory({
      name: newCategoryName.trim(),
      color: selectedColor,
    })

    setNewCategoryName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Organize and classify tasks by creating personalized category labels with color indicators.
          </DialogDescription>
        </DialogHeader>

        {/* Create new category form */}
        <form onSubmit={handleCreate} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">New Category Name</Label>
            <div className="flex gap-2">
              <Input
                id="category-name"
                placeholder="e.g., Marketing, Urgent bugs..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newCategoryName.trim()} size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category Color Indicator</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </form>

        <div className="mt-4 border-t pt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Existing Categories ({categories.length})
          </Label>

          <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {categories.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No custom categories yet. Create one above!
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm bg-card hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-foreground">{cat.name}</span>
                    {cat.todos_count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({cat.todos_count} {cat.todos_count === 1 ? 'task' : 'tasks'})
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                    title={`Delete category ${cat.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
