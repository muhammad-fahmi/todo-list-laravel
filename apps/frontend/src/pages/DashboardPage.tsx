import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  useTodos,
  useTodoSummary,
  useToggleTodo,
  useDeleteTodo,
  useCreateTodo,
  useUpdateTodo,
} from '@/hooks/useTodos'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { AppLayout } from '@/components/layout/AppLayout'
import { SummaryCards } from '@/components/todos/SummaryCards'
import { TodoFiltersBar } from '@/components/todos/TodoFiltersBar'
import { TodoCard } from '@/components/todos/TodoCard'
import { TodoDialog } from '@/components/todos/TodoDialog'
import { CategoryDialog } from '@/components/todos/CategoryDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Todo, TodoFilters } from '@/types'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // Filter State
  const [filters, setFilters] = useState<TodoFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
  })

  // Dialog States
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

  // Data Queries
  const { data: todosResponse, isLoading: isTodosLoading } = useTodos(filters)
  const { data: summaryResponse, isLoading: isSummaryLoading } = useTodoSummary()
  const { data: categoriesResponse } = useCategories()

  // Mutations with Optimistic Updates
  const toggleMutation = useToggleTodo()
  const deleteMutation = useDeleteTodo()
  const createMutation = useCreateTodo()
  const updateMutation = useUpdateTodo()
  const createCategoryMutation = useCreateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const todos = todosResponse?.data || []
  const pagination = todosResponse?.meta
  const categories = categoriesResponse?.data || []
  const summary = summaryResponse?.data

  const handleFilterChange = (newFilters: Partial<TodoFilters>) => {
    setFilters((prev: TodoFilters) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev: TodoFilters) => ({
      ...prev,
      page: newPage,
    }))
  }

  const handleOpenCreateDialog = () => {
    setTodoToEdit(null)
    setIsTaskDialogOpen(true)
  }

  const handleOpenEditDialog = (todo: Todo) => {
    setTodoToEdit(todo)
    setIsTaskDialogOpen(true)
  }

  const handleTaskSubmit = (data: Partial<Todo> & { title: string }) => {
    if (todoToEdit) {
      updateMutation.mutate({ id: todoToEdit.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <AppLayout
      categories={categories}
      activeFilters={filters}
      onFilterChange={handleFilterChange}
      onOpenCategoryDialog={() => setIsCategoryDialogOpen(true)}
    >
      <div className="space-y-6">
        {/* Welcome & Action Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Good day, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organize your priorities, track progress, and stay focused with instant optimistic updates.
            </p>
          </div>

          <Button onClick={handleOpenCreateDialog} className="shadow-md shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>

        {/* Overview Analytics Metrics */}
        <SummaryCards summary={summary} isLoading={isSummaryLoading} />

        {/* Filter and Search Bar */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TodoFiltersBar
            filters={filters}
            categories={categories}
            onFiltersChange={handleFilterChange}
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-foreground">
              Tasks {pagination?.total !== undefined ? `(${pagination.total})` : ''}
            </h2>
            {filters.date_range && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">
                Filtered: {filters.date_range.replace('_', ' ')}
              </span>
            )}
          </div>

          {isTodosLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-2/3 ml-8" />
                </div>
              ))}
            </div>
          ) : todos.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-slate-50/50 py-16 text-center dark:bg-slate-900/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No tasks found</h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {filters.search || filters.status || filters.priority || filters.category_id || filters.date_range
                  ? 'No tasks match your active filters. Try adjusting or clearing search criteria.'
                  : "You're all caught up! Create your first task to start planning your day."}
              </p>
              <Button onClick={handleOpenCreateDialog} variant="outline" className="mt-5">
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggle={(id) => toggleMutation.mutate(id)}
                  onEdit={handleOpenEditDialog}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between pt-4 border-t px-1">
              <p className="text-xs text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total items)
              </p>

              <div className="flex items-center space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="h-8 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation & Editing Dialog */}
      <TodoDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        todoToEdit={todoToEdit}
        categories={categories}
        onSubmit={handleTaskSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Category Management Dialog */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        onCreateCategory={(data) => createCategoryMutation.mutate(data)}
        onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
      />
    </AppLayout>
  )
}
