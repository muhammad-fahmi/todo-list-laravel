import React from 'react'
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category, TodoFilters } from '@/types'

interface TodoFiltersBarProps {
  filters: TodoFilters
  categories: Category[]
  onFiltersChange: (newFilters: Partial<TodoFilters>) => void
}

export const TodoFiltersBar: React.FC<TodoFiltersBarProps> = ({
  filters,
  categories,
  onFiltersChange,
}) => {
  const currentStatus = filters.status || 'all'

  return (
    <div className="space-y-3">
      {/* Top row: Search input & Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 pr-8"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <Tabs
          value={currentStatus}
          onValueChange={(val) => onFiltersChange({ status: val === 'all' ? undefined : val })}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Second row: Granular Filter Dropdowns & Sorting */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {/* Priority Filter */}
        <div className="w-[130px] sm:w-[140px]">
          <Select
            value={filters.priority || 'all'}
            onValueChange={(val) => onFiltersChange({ priority: val === 'all' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="w-[140px] sm:w-[150px]">
          <Select
            value={filters.category_id ? String(filters.category_id) : 'all'}
            onValueChange={(val) => onFiltersChange({ category_id: val === 'all' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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

        {/* Date Range Preset */}
        <div className="w-[130px] sm:w-[140px]">
          <Select
            value={filters.date_range || 'all'}
            onValueChange={(val) => onFiltersChange({ date_range: val === 'all' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="ml-auto flex items-center space-x-1.5">
          <div className="w-[135px]">
            <Select
              value={filters.sort_by || 'created_at'}
              onValueChange={(val) => onFiltersChange({ sort_by: val })}
            >
              <SelectTrigger className="h-8 text-xs">
                <ArrowUpDown className="mr-1 h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onFiltersChange({ sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc' })
            }
            className="h-8 w-8 text-muted-foreground"
            title={`Sort order: ${filters.sort_order || 'desc'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
