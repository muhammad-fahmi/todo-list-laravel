import { apiClient } from '@/lib/apiClient'
import type { ApiResponse, Todo, TodoFilters, TodoSummary } from '@/types'

/**
 * Service for Todo item CRUD, status toggling, and dashboard summary.
 */
export const todoService = {
  /**
   * Fetch paginated todos matching filters.
   *
   * @param filters - Search query, status, priority, category, sorting params.
   */
  async getTodos(filters: TodoFilters = {}): Promise<ApiResponse<Todo[]>> {
    const response = await apiClient.get<ApiResponse<Todo[]>>('/todos', { params: filters })
    return response.data
  },

  /**
   * Fetch single todo details by ID.
   *
   * @param id - Task ID.
   */
  async getTodo(id: number): Promise<ApiResponse<Todo>> {
    const response = await apiClient.get<ApiResponse<Todo>>(`/todos/${id}`)
    return response.data
  },

  /**
   * Create a new todo task.
   *
   * @param data - Task creation attributes.
   */
  async createTodo(data: Partial<Todo> & { title: string }): Promise<ApiResponse<Todo>> {
    const response = await apiClient.post<ApiResponse<Todo>>('/todos', data)
    return response.data
  },

  /**
   * Update an existing task.
   *
   * @param id - Task ID.
   * @param data - Modified task attributes.
   */
  async updateTodo(id: number, data: Partial<Todo>): Promise<ApiResponse<Todo>> {
    const response = await apiClient.put<ApiResponse<Todo>>(`/todos/${id}`, data)
    return response.data
  },

  /**
   * Quick toggle task status between completed and pending.
   *
   * @param id - Task ID.
   */
  async toggleStatus(id: number): Promise<ApiResponse<Todo>> {
    const response = await apiClient.patch<ApiResponse<Todo>>(`/todos/${id}/toggle`)
    return response.data
  },

  /**
   * Delete a task by ID.
   *
   * @param id - Task ID.
   */
  async deleteTodo(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/todos/${id}`)
    return response.data
  },

  /**
   * Fetch aggregated summary and completion statistics for the user.
   */
  async getSummary(): Promise<ApiResponse<TodoSummary>> {
    const response = await apiClient.get<ApiResponse<TodoSummary>>('/todos/summary')
    return response.data
  },
}
