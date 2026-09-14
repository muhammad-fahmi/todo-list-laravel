<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CreateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\User;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class CategoryController
 *
 * RESTful endpoint handler for user task categories.
 */
class CategoryController extends Controller
{
    /**
     * CategoryController constructor.
     */
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of categories belonging to the user.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $categories = $this->categoryService->getCategories($user);

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(CreateCategoryRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $category = $this->categoryService->createCategory($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], Response::HTTP_CREATED);
    }

    /**
     * Update the specified category.
     */
    public function update(CreateCategoryRequest $request, Category $category): JsonResponse
    {
        Gate::authorize('update', $category);

        $updatedCategory = $this->categoryService->updateCategory($category, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($updatedCategory),
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        Gate::authorize('delete', $category);

        $this->categoryService->deleteCategory($category);

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
