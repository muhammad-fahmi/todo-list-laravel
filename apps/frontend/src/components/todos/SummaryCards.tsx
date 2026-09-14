import React from 'react'
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TodoSummary } from '@/types'

interface SummaryCardsProps {
  summary?: TodoSummary
  isLoading: boolean
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </Card>
        ))}
      </div>
    )
  }

  const s = summary || {
    total: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    overdue: 0,
    urgent_count: 0,
    completion_rate: 0,
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {/* Total Tasks */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-slate-50/50 dark:to-slate-900/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Tasks</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">{s.total}</span>
            <span className="text-xs text-muted-foreground">items</span>
          </div>
        </CardContent>
      </Card>

      {/* Completed & Rate */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-emerald-50/20 dark:to-emerald-950/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {s.completed}
            </span>
            <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80">
              {s.completion_rate}% done
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, s.completion_rate))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending / Active */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-blue-50/20 dark:to-blue-950/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {s.pending + s.in_progress}
            </span>
            <span className="text-xs text-muted-foreground">remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Overdue / Urgent */}
      <Card
        className={`relative overflow-hidden border-border/60 transition-colors ${
          s.overdue > 0
            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-500/30'
            : 'bg-gradient-to-br from-card to-slate-50/50 dark:to-slate-900/50'
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Attention</p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                s.overdue > 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {s.overdue > 0 ? <AlertTriangle className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl sm:text-3xl font-bold ${
                s.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
              }`}
            >
              {s.overdue}
            </span>
            <span className="text-xs text-muted-foreground">
              {s.overdue === 1 ? 'task overdue' : 'tasks overdue'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
