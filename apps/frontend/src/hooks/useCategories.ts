import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '@/services/categoryService'

/**
 * Hook to retrieve user categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to create a category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; color?: string; icon?: string }) => categoryService.createCategory(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Category created.')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      toast.error('Failed to create category.')
    },
  })
}

/**
 * Hook to delete a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted.')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: () => {
      toast.error('Failed to delete category.')
    },
  })
}
