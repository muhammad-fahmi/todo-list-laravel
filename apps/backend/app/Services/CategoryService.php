<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class CategoryService
 *
 * Manages category operations for organizing user tasks.
 */
class CategoryService
{
    /**
     * Retrieve all categories owned by a user with task counts.
     *
     * @return Collection<int, Category>
     */
    public function getCategories(User $user): Collection
    {
        return $user->categories()
            ->withCount('todos')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a new category for the user.
     *
     * @param  array{name: string, color?: string, icon?: string|null}  $data
     */
    public function createCategory(User $user, array $data): Category
    {
        return $user->categories()->create([
            'name' => $data['name'],
            'color' => $data['color'] ?? '#6366f1',
            'icon' => $data['icon'] ?? null,
        ]);
    }

    /**
     * Update an existing category.
     *
     * @param  array{name?: string, color?: string, icon?: string|null}  $data
     */
    public function updateCategory(Category $category, array $data): Category
    {
        $category->update($data);

        return $category;
    }

    /**
     * Delete a category.
     */
    public function deleteCategory(Category $category): void
    {
        $category->delete();
    }
}
