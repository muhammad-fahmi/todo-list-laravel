/**
 * TypeScript Data Transfer Objects and Domain Types for Todo Application.
 */

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at?: string
}

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Category {
  id: number
  name: string
  color: string
  icon?: string | null
  todos_count?: number
  created_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Todo {
  id: number
  user_id: number
  category_id?: number | null
  title: string
  description?: string | null
  status: TodoStatus
  priority: TodoPriority
  due_date?: string | null
  completed_at?: string | null
  category?: Category | null
  tags?: Tag[]
  created_at: string
  updated_at: string
  isOptimistic?: boolean
}

export interface TodoSummary {
  total: number
  completed: number
  pending: number
  in_progress: number
  overdue: number
  urgent_count: number
  completion_rate: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  meta?: PaginationMeta
}

export interface AuthResponseData {
  user: User
  token: string
  token_type: string
  expires_in: number
}

export interface TodoFilters {
  status?: string
  priority?: string
  category_id?: string | number
  search?: string
  date_range?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
