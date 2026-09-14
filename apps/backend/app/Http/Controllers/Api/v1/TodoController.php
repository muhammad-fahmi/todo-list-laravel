<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Todo\CreateTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Http\Resources\TodoSummaryResource;
use App\Models\Todo;
use App\Models\User;
use App\Services\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class TodoController
 *
 * RESTful endpoint handler for user tasks, filters, toggles, and analytics summary.
 */
class TodoController extends Controller
{
    /**
     * TodoController constructor.
     */
    public function __construct(
        protected TodoService $todoService
    ) {}

    /**
     * Display a listing of the user's todos with dynamic filtering.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);
        $filters = $request->only(['status', 'priority', 'category_id', 'search', 'date_range', 'sort_by', 'sort_order']);

        $todos = $this->todoService->getPaginatedTodos($user, $filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => TodoResource::collection($todos),
            'meta' => [
                'current_page' => $todos->currentPage(),
                'last_page' => $todos->lastPage(),
                'per_page' => $todos->perPage(),
                'total' => $todos->total(),
            ],
        ]);
    }

    /**
     * Store a newly created todo task in storage.
     */
    public function store(CreateTodoRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $todo = $this->todoService->createTodo($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
            'data' => new TodoResource($todo),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified todo task.
     */
    public function show(Todo $todo): JsonResponse
    {
        Gate::authorize('view', $todo);

        return response()->json([
            'success' => true,
            'data' => new TodoResource($todo->load(['category', 'tags'])),
        ]);
    }

    /**
     * Update the specified todo task.
     */
    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        Gate::authorize('update', $todo);

        $updatedTodo = $this->todoService->updateTodo($todo, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data' => new TodoResource($updatedTodo),
        ]);
    }

    /**
     * Toggle the completion status of the specified task.
     */
    public function toggle(Todo $todo): JsonResponse
    {
        Gate::authorize('update', $todo);

        $toggledTodo = $this->todoService->toggleStatus($todo);

        return response()->json([
            'success' => true,
            'message' => $toggledTodo->isCompleted() ? 'Task marked as completed.' : 'Task marked as pending.',
            'data' => new TodoResource($toggledTodo),
        ]);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Todo $todo): JsonResponse
    {
        Gate::authorize('delete', $todo);

        $this->todoService->deleteTodo($todo);

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully.',
        ]);
    }

    /**
     * Retrieve aggregated statistics for user tasks.
     */
    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $summary = $this->todoService->getSummary($user);

        return response()->json([
            'success' => true,
            'data' => new TodoSummaryResource($summary),
        ]);
    }
}
