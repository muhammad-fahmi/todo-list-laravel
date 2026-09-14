<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

/**
 * Class TodoService
 *
 * Handles domain logic, dynamic queries, and lifecycle management for Todo items.
 */
class TodoService
{
    /**
     * Retrieve paginated todos for a given user with flexible filtering and sorting.
     *
     * @param User $user The authenticated user owning the todos.
     * @param array<string, mixed> $filters Search, status, priority, and date filters.
     * @param int $perPage Number of results per page.
     * @return LengthAwarePaginator<Todo>
     */
    public function getPaginatedTodos(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->todos()
            ->with(['category', 'tags']);

        // Filter by Status
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Filter by Priority
        if (! empty($filters['priority']) && $filters['priority'] !== 'all') {
            $query->where('priority', $filters['priority']);
        }

        // Filter by Category
        if (! empty($filters['category_id']) && $filters['category_id'] !== 'all') {
            $query->where('category_id', (int) $filters['category_id']);
        }

        // Text Search
        if (! empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        // Due date filtering presets
        if (! empty($filters['date_range'])) {
            $now = Carbon::now();
            match ($filters['date_range']) {
                'today' => $query->whereDate('due_date', $now->toDateString()),
                'this_week' => $query->whereBetween('due_date', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]),
                'overdue' => $query->where('due_date', '<', $now)->where('status', '!=', 'completed'),
                default => null,
            };
        }

        // Sorting
        $sortBy = in_array($filters['sort_by'] ?? '', ['due_date', 'priority', 'title', 'created_at'], true)
            ? $filters['sort_by']
            : 'created_at';

        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Create a new Todo item for the user.
     *
     * @param User $user The authenticated task owner.
     * @param array<string, mixed> $data Validated task attributes.
     */
    public function createTodo(User $user, array $data): Todo
    {
        $dueDate = ! empty($data['due_date']) ? Carbon::parse($data['due_date']) : null;

        /** @var Todo $todo */
        $todo = $user->todos()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'status' => $data['status'] ?? 'pending',
            'category_id' => $data['category_id'] ?? null,
            'due_date' => $dueDate,
            'completed_at' => ($data['status'] ?? '') === 'completed' ? Carbon::now() : null,
        ]);

        if (! empty($data['tag_ids']) && is_array($data['tag_ids'])) {
            $todo->tags()->sync($data['tag_ids']);
        }

        return $todo->load(['category', 'tags']);
    }

    /**
     * Update an existing Todo item.
     *
     * @param Todo $todo The task to update.
     * @param array<string, mixed> $data Validated update attributes.
     */
    public function updateTodo(Todo $todo, array $data): Todo
    {
        if (array_key_exists('due_date', $data)) {
            $data['due_date'] = ! empty($data['due_date']) ? Carbon::parse($data['due_date']) : null;
        }

        if (isset($data['status'])) {
            if ($data['status'] === 'completed' && ! $todo->isCompleted()) {
                $data['completed_at'] = Carbon::now();
            } elseif ($data['status'] !== 'completed') {
                $data['completed_at'] = null;
            }
        }

        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $todo->update($data);

        if ($tagIds !== null && is_array($tagIds)) {
            $todo->tags()->sync($tagIds);
        }

        return $todo->load(['category', 'tags']);
    }

    /**
     * Toggle the completed status of a Todo task.
     *
     * @param Todo $todo The task to toggle.
     */
    public function toggleStatus(Todo $todo): Todo
    {
        if ($todo->isCompleted()) {
            $todo->markAsPending();
        } else {
            $todo->markAsCompleted();
        }

        return $todo->fresh(['category', 'tags']);
    }

    /**
     * Delete a Todo task.
     *
     * @param Todo $todo The task to delete.
     */
    public function deleteTodo(Todo $todo): void
    {
        $todo->delete();
    }

    /**
     * Compute aggregated statistics and metrics for the user's tasks.
     *
     * @param User $user The authenticated user.
     * @return array{
     *     total: int,
     *     completed: int,
     *     pending: int,
     *     in_progress: int,
     *     overdue: int,
     *     urgent_count: int,
     *     completion_rate: float
     * }
     */
    public function getSummary(User $user): array
    {
        $todos = $user->todos()->get();
        $total = $todos->count();
        $completed = $todos->where('status', 'completed')->count();
        $pending = $todos->where('status', 'pending')->count();
        $inProgress = $todos->where('status', 'in_progress')->count();
        $urgentCount = $todos->where('priority', 'urgent')->where('status', '!=', 'completed')->count();

        $now = Carbon::now();
        $overdue = $todos->filter(function (Todo $t) use ($now) {
            return $t->status !== 'completed' && $t->due_date !== null && $t->due_date->lt($now);
        })->count();

        $completionRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0.0;

        return [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'overdue' => $overdue,
            'urgent_count' => $urgentCount,
            'completion_rate' => $completionRate,
        ];
    }
}
