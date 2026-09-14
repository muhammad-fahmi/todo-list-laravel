<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class TagService
 *
 * Manages tags for fine-grained task labeling.
 */
class TagService
{
    /**
     * Retrieve all tags belonging to the user.
     *
     * @return Collection<int, Tag>
     */
    public function getTags(User $user): Collection
    {
        return $user->tags()->orderBy('name', 'asc')->get();
    }

    /**
     * Create a new tag for the user.
     *
     * @param array{name: string, color?: string} $data
     */
    public function createTag(User $user, array $data): Tag
    {
        return $user->tags()->create([
            'name' => $data['name'],
            'color' => $data['color'] ?? '#10b981',
        ]);
    }

    /**
     * Delete a tag.
     */
    public function deleteTag(Tag $tag): void
    {
        $tag->delete();
    }
}
