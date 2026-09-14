import { apiClient } from '@/lib/apiClient'
import type { ApiResponse, Category } from '@/types'

/**
 * Service for category management.
 */
export const categoryService = {
  /**
   * Fetch user categories.
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories')
    return response.data
  },

  /**
   * Create a new category.
   */
  async createCategory(data: { name: string; color?: string; icon?: string }): Promise<ApiResponse<Category>> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data)
    return response.data
  },

  /**
   * Update category.
   */
  async updateCategory(id: number, data: { name?: string; color?: string; icon?: string }): Promise<ApiResponse<Category>> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data
  },

  /**
   * Delete category.
   */
  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`)
    return response.data
  },
}
