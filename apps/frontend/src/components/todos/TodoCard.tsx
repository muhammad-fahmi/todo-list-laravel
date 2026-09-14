import React, { useState } from 'react'
import { Calendar, MoreVertical, Pencil, Trash2, Tag as TagIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Todo, TodoPriority } from '@/types'

interface TodoCardProps {
  todo: Todo
  onToggle: (id: number) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggle, onEdit, onDelete }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const isCompleted = todo.status === 'completed'
  const isOverdue =
    !isCompleted && todo.due_date ? new Date(todo.due_date).getTime() < new Date().getTime() : false

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const getPriorityVariant = (priority: TodoPriority) => {
    switch (priority) {
      case 'urgent':
        return 'urgent'
      case 'high':
        return 'high'
      case 'medium':
        return 'medium'
      case 'low':
      default:
        return 'low'
    }
  }

  return (
    <>
      <div
        className={`group relative flex items-start space-x-3.5 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-border/80 ${
          isCompleted ? 'border-border/40 bg-slate-50/50 dark:bg-slate-900/30 opacity-75' : 'border-border/70'
        } ${todo.isOptimistic ? 'animate-pulse' : ''}`}
      >
        {/* Quick Complete Checkbox (Optimistic Action) */}
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(todo.id)}
            className="h-5 w-5 rounded-md border-muted-foreground/40 transition-transform active:scale-90"
            aria-label={`Mark task "${todo.title}" as ${isCompleted ? 'pending' : 'completed'}`}
          />
        </div>

        {/* Task Details */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={() => onToggle(todo.id)}
              className={`cursor-pointer text-sm sm:text-base font-medium leading-snug break-words transition-colors ${
                isCompleted
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {todo.title}
            </h4>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(todo)} className="cursor-pointer">
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteAlert(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {todo.description && (
            <p
              className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Badges & Metadata */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Priority Badge */}
            <Badge variant={getPriorityVariant(todo.priority)} className="capitalize font-medium">
              {todo.priority}
            </Badge>

            {/* Category Tag */}
            {todo.category && (
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border"
                style={{
                  backgroundColor: `${todo.category.color}15`,
                  borderColor: `${todo.category.color}35`,
                  color: todo.category.color,
                }}
              >
                <span
                  className="mr-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: todo.category.color }}
                />
                {todo.category.name}
              </span>
            )}

            {/* Tags */}
            {todo.tags?.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                <TagIcon className="mr-1 h-2.5 w-2.5" />
                {tag.name}
              </span>
            ))}

            {/* Due Date Indicator */}
            {todo.due_date && (
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  isOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-muted-foreground'
                }`}
                title={isOverdue ? 'Task is overdue' : 'Due date'}
              >
                <Calendar className="mr-1 h-3 w-3" />
                {isOverdue ? 'Overdue: ' : ''}
                {formatDueDate(todo.due_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{todo.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(todo.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
