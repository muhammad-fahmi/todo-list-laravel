import React, { useState } from 'react'
import {
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FolderPlus,
  LogOut,
  Menu,
  X,
  ListTodo,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import type { Category, TodoFilters } from '@/types'

interface AppLayoutProps {
  categories: Category[]
  activeFilters: TodoFilters
  onFilterChange: (filters: Partial<TodoFilters>) => void
  onOpenCategoryDialog: () => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  categories,
  activeFilters,
  onFilterChange,
  onOpenCategoryDialog,
  children,
}) => {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isCurrentFilter = (key: keyof TodoFilters, value?: string) => {
    if (value === undefined) {
      return activeFilters[key] === undefined
    }
    return activeFilters[key] === value
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">TaskFlow</span>
              <span className="hidden text-[10px] sm:inline-block ml-2 rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary uppercase tracking-wider">
                Monorepo
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-slate-50/50 p-4 dark:bg-slate-900/30">
          <nav className="space-y-6">
            {/* Quick Views */}
            <div className="space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Views
              </p>

              <button
                onClick={() => onFilterChange({ date_range: undefined, status: undefined, category_id: undefined })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrentFilter('date_range') && isCurrentFilter('status') && isCurrentFilter('category_id')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="flex items-center">
                  <ListTodo className="mr-2.5 h-4 w-4" />
                  All Tasks
                </span>
              </button>

              <button
                onClick={() => onFilterChange({ date_range: 'today', status: undefined, category_id: undefined })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrentFilter('date_range', 'today')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="flex items-center">
                  <Calendar className="mr-2.5 h-4 w-4" />
                  Today
                </span>
              </button>

              <button
                onClick={() => onFilterChange({ date_range: 'overdue', status: undefined, category_id: undefined })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrentFilter('date_range', 'overdue')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="flex items-center">
                  <AlertTriangle className="mr-2.5 h-4 w-4" />
                  Overdue
                </span>
              </button>

              <button
                onClick={() => onFilterChange({ status: 'completed', date_range: undefined, category_id: undefined })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrentFilter('status', 'completed')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="flex items-center">
                  <CheckCircle2 className="mr-2.5 h-4 w-4" />
                  Completed
                </span>
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </p>
                <button
                  onClick={onOpenCategoryDialog}
                  className="text-xs text-primary hover:underline flex items-center"
                >
                  <FolderPlus className="mr-1 h-3.5 w-3.5" />
                  Manage
                </button>
              </div>

              <div className="space-y-0.5">
                {categories.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground italic">No categories yet</p>
                ) : (
                  categories.map((cat) => {
                    const isSelected = activeFilters.category_id === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          onFilterChange({
                            category_id: isSelected ? undefined : cat.id,
                          })
                        }
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-accent font-semibold text-foreground border border-border'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center truncate">
                          <span
                            className="mr-2.5 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {cat.todos_count !== undefined && (
                          <span className="text-xs text-muted-foreground font-normal ml-2">
                            {cat.todos_count}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile menu modal */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
            <div className="w-64 bg-background p-4 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="font-bold">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onFilterChange({ date_range: undefined, status: undefined, category_id: undefined })
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
                  >
                    <ListTodo className="mr-2.5 h-4 w-4" /> All Tasks
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange({ date_range: 'today', status: undefined, category_id: undefined })
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
                  >
                    <Calendar className="mr-2.5 h-4 w-4" /> Today
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange({ date_range: 'overdue', status: undefined, category_id: undefined })
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-rose-500"
                  >
                    <AlertTriangle className="mr-2.5 h-4 w-4" /> Overdue
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
