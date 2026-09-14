<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_and_list_categories(): void
    {
        $user = User::factory()->create();
        $token = auth('api')->login($user);

        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/categories', [
                'name' => 'Personal Projects',
                'color' => '#10b981',
                'icon' => 'folder',
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Personal Projects');

        $listResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/categories');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Personal Projects');
    }

    public function test_user_cannot_delete_another_users_category(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $category = Category::create([
            'user_id' => $user1->id,
            'name' => 'Secret',
            'color' => '#ef4444',
        ]);

        $tokenUser2 = auth('api')->login($user2);

        $response = $this->withHeader('Authorization', "Bearer {$tokenUser2}")
            ->deleteJson("/api/v1/categories/{$category->id}");

        $response->assertStatus(403);
    }
}
