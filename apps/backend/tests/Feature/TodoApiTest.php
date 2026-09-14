<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_own_todos_only(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Todo::create([
            'user_id' => $user1->id,
            'title' => 'User 1 Task',
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        Todo::create([
            'user_id' => $user2->id,
            'title' => 'User 2 Task',
            'status' => 'pending',
            'priority' => 'high',
        ]);

        $token = auth('api')->login($user1);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/todos');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'User 1 Task');
    }

    public function test_user_can_create_todo_with_category(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Work',
            'color' => '#6366f1',
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/todos', [
                'title' => 'Complete Quarterly Report',
                'description' => 'Include financial graphs and projections.',
                'priority' => 'high',
                'category_id' => $category->id,
                'due_date' => now()->addDays(2)->toIso8601String(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Complete Quarterly Report')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.category.name', 'Work');

        $this->assertDatabaseHas('todos', [
            'user_id' => $user->id,
            'title' => 'Complete Quarterly Report',
            'priority' => 'high',
        ]);
    }

    public function test_user_can_toggle_todo_completion_status(): void
    {
        $user = User::factory()->create();
        $todo = Todo::create([
            'user_id' => $user->id,
            'title' => 'Grocery Shopping',
            'status' => 'pending',
            'priority' => 'low',
        ]);

        $token = auth('api')->login($user);

        // Toggle to completed
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/todos/{$todo->id}/toggle");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $this->assertNotNull($todo->fresh()->completed_at);

        // Toggle back to pending
        $response2 = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/todos/{$todo->id}/toggle");

        $response2->assertStatus(200)
            ->assertJsonPath('data.status', 'pending');

        $this->assertNull($todo->fresh()->completed_at);
    }

    public function test_user_cannot_view_or_modify_another_users_todo(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $todo = Todo::create([
            'user_id' => $user1->id,
            'title' => 'Confidential Task',
            'status' => 'pending',
            'priority' => 'urgent',
        ]);

        $tokenUser2 = auth('api')->login($user2);

        // User 2 tries to view User 1's todo
        $response = $this->withHeader('Authorization', "Bearer {$tokenUser2}")
            ->getJson("/api/v1/todos/{$todo->id}");
        $response->assertStatus(403);

        // User 2 tries to toggle User 1's todo
        $responseToggle = $this->withHeader('Authorization', "Bearer {$tokenUser2}")
            ->patchJson("/api/v1/todos/{$todo->id}/toggle");
        $responseToggle->assertStatus(403);

        // User 2 tries to delete User 1's todo
        $responseDelete = $this->withHeader('Authorization', "Bearer {$tokenUser2}")
            ->deleteJson("/api/v1/todos/{$todo->id}");
        $responseDelete->assertStatus(403);
    }

    public function test_user_can_retrieve_todo_summary_statistics(): void
    {
        $user = User::factory()->create();

        Todo::create([
            'user_id' => $user->id,
            'title' => 'Task 1',
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        Todo::create([
            'user_id' => $user->id,
            'title' => 'Task 2',
            'status' => 'pending',
            'priority' => 'urgent',
            'due_date' => now()->subDay(), // Overdue
        ]);

        Todo::create([
            'user_id' => $user->id,
            'title' => 'Task 3',
            'status' => 'pending',
            'priority' => 'medium',
            'due_date' => now()->addDay(),
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/todos/summary');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.pending', 2)
            ->assertJsonPath('data.overdue', 1)
            ->assertJsonPath('data.urgent_count', 1)
            ->assertJsonPath('data.completion_rate', 33.3);
    }
}
