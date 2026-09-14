import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { todoService } from '@/services/todoService'
import type { ApiResponse, Todo, TodoFilters, TodoSummary } from '@/types'

/**
 * Hook to retrieve user todos with filter params.
 */
export function useTodos(filters: TodoFilters = {}) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoService.getTodos(filters),
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to retrieve aggregated dashboard metrics.
 */
export function useTodoSummary() {
  return useQuery({
    queryKey: ['todos', 'summary'],
    queryFn: () => todoService.getSummary(),
    staleTime: 1000 * 30,
  })
}

/**
 * Hook to toggle task completion status with OPTIMISTIC UI updates.
 */
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todoId: number) => todoService.toggleStatus(todoId),
    onMutate: async (todoId: number) => {
      // 1. Cancel ongoing queries so they don't overwrite optimistic data
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // 2. Snapshot current state across matching queries
      const queryCache = queryClient.getQueryCache()
      const todoQueries = queryCache.findAll({ queryKey: ['todos'] })
      const previousDataMap = new Map()

      todoQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data)
      })

      const previousSummary = queryClient.getQueryData<ApiResponse<TodoSummary>>(['todos', 'summary'])

      // 3. Optimistically update todos in cache
      todoQueries.forEach((query) => {
        if (query.queryKey[1] === 'summary') return

        queryClient.setQueryData(query.queryKey, (old: ApiResponse<Todo[]> | undefined) => {
          if (!old?.data) return old

          return {
            ...old,
            data: old.data.map((todo) => {
              if (todo.id !== todoId) return todo

              const isNowCompleted = todo.status !== 'completed'
              return {
                ...todo,
                status: isNowCompleted ? 'completed' : 'pending',
                completed_at: isNowCompleted ? new Date().toISOString() : null,
              }
            }),
          }
        })
      })

      // 4. Optimistically update summary metrics
      if (previousSummary?.data) {
        queryClient.setQueryData(['todos', 'summary'], (old: ApiResponse<TodoSummary> | undefined) => {
          if (!old?.data) return old
          const sum = old.data
          // Look up current status from cache
          const currentTodo = (queryClient.getQueryData(['todos', {}]) as ApiResponse<Todo[]> | undefined)?.data?.find((t) => t.id === todoId)
          const isNowCompleted = currentTodo ? currentTodo.status === 'completed' : true

          const newCompleted = isNowCompleted ? sum.completed + 1 : Math.max(0, sum.completed - 1)
          const newPending = isNowCompleted ? Math.max(0, sum.pending - 1) : sum.pending + 1

          return {
            ...old,
            data: {
              ...sum,
              completed: newCompleted,
              pending: newPending,
              completion_rate: sum.total > 0 ? Number(((newCompleted / sum.total) * 100).toFixed(1)) : 0,
            },
          }
        })
      }

      return { previousDataMap, previousSummary }
    },
    onError: (_err, _todoId, context) => {
      // Rollback to snapshots
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, key) => {
          queryClient.setQueryData(key, data)
        })
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(['todos', 'summary'], context.previousSummary)
      }
      toast.error('Failed to update task status. Reverting changes.')
    },
    onSettled: () => {
      // Re-sync with authoritative server state
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] })
    },
  })
}

/**
 * Hook to delete a task with OPTIMISTIC UI removal.
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todoId: number) => todoService.deleteTodo(todoId),
    onMutate: async (todoId: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const queryCache = queryClient.getQueryCache()
      const todoQueries = queryCache.findAll({ queryKey: ['todos'] })
      const previousDataMap = new Map()

      todoQueries.forEach((query) => {
        previousDataMap.set(query.queryKey, query.state.data)
      })

      // Optimistically remove from list
      todoQueries.forEach((query) => {
        if (query.queryKey[1] === 'summary') return

        queryClient.setQueryData(query.queryKey, (old: ApiResponse<Todo[]> | undefined) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.filter((todo) => todo.id !== todoId),
          }
        })
      })

      return { previousDataMap }
    },
    onError: (_err, _todoId, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, key) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error('Could not delete task. Restoring...')
    },
    onSuccess: () => {
      toast.success('Task deleted successfully.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] })
    },
  })
}

/**
 * Hook to create a task with optimistic preview.
 */
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Todo> & { title: string }) => todoService.createTodo(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Task created successfully.')
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] })
    },
    onError: () => {
      toast.error('Failed to create task.')
    },
  })
}

/**
 * Hook to update an existing task.
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Todo> }) => todoService.updateTodo(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Task updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', 'summary'] })
    },
    onError: () => {
      toast.error('Failed to update task.')
    },
  })
}
