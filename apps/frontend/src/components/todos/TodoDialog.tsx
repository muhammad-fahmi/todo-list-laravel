import React, { useEffect, useRef } from 'react'
import { Calendar, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category, Todo, TodoPriority, TodoStatus } from '@/types'

const todoFormSchema = z.object({
  title: z.string().min(1, 'Task title is required.').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const),
  category_id: z.string().optional(),
  due_date: z.string().optional(),
})

type TodoFormValues = z.infer<typeof todoFormSchema>

interface TodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todoToEdit?: Todo | null
  categories: Category[]
  onSubmit: (data: Partial<Todo> & { title: string }) => void
  isSubmitting?: boolean
}

export const TodoDialog: React.FC<TodoDialogProps> = ({
  open,
  onOpenChange,
  todoToEdit,
  categories,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = !!todoToEdit
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      category_id: 'none',
      due_date: '',
    },
  })

  useEffect(() => {
    if (todoToEdit) {
      // Format date for date input
      let formattedDate = ''
      if (todoToEdit.due_date) {
        const d = new Date(todoToEdit.due_date)
        formattedDate = d.toISOString().split('T')[0]
      }

      reset({
        title: todoToEdit.title,
        description: todoToEdit.description || '',
        priority: todoToEdit.priority,
        status: todoToEdit.status,
        category_id: todoToEdit.category_id ? String(todoToEdit.category_id) : 'none',
        due_date: formattedDate,
      })
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category_id: 'none',
        due_date: '',
      })
    }
  }, [todoToEdit, open, reset])

  const handleFormSubmit = (values: TodoFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      priority: values.priority as TodoPriority,
      status: values.status as TodoStatus,
      category_id: values.category_id && values.category_id !== 'none' ? Number(values.category_id) : null,
      due_date: values.due_date ? `${values.due_date}T23:59:59` : null,
    })
    onOpenChange(false)
  }

  const priorityVal = watch('priority')
  const statusVal = watch('status')
  const categoryVal = watch('category_id')
  const dueDateVal = watch('due_date')
  const { ref: registerDueDateRef, ...restDueDateRegister } = register('due_date')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your task. Changes apply instantaneously.'
              : 'Add a new task to your workspace with priority, category, and due date.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Complete security audit report"
              {...register('title')}
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add additional context, notes, or checklist items..."
              rows={3}
              {...register('description')}
              disabled={isSubmitting}
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priorityVal}
                onValueChange={(val) => setValue('priority', val as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={statusVal}
                onValueChange={(val) => setValue('status', val as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryVal}
                onValueChange={(val) => setValue('category_id', val)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <div className="flex items-center">
                        <span
                          className="mr-1.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="due_date"
                  className="cursor-pointer flex items-center gap-1.5"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker()
                    } catch {}
                    dateInputRef.current?.focus()
                  }}
                >
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Due Date
                </Label>
                {dueDateVal && (
                  <button
                    type="button"
                    onClick={() => setValue('due_date', '', { shouldDirty: true })}
                    className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
              <Input
                id="due_date"
                type="date"
                className="w-full cursor-pointer"
                {...restDueDateRegister}
                ref={(e) => {
                  registerDueDateRef(e)
                  dateInputRef.current = e
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker()
                  } catch {}
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    try {
                      e.currentTarget.showPicker()
                    } catch {}
                  }
                }}
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setValue('due_date', today, { shouldDirty: true })
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    setValue('due_date', tomorrow, { shouldDirty: true })
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
                    setValue('due_date', nextWeek, { shouldDirty: true })
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  +1 wk
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
