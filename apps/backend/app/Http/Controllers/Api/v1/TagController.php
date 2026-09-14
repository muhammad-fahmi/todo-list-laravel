<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\CreateTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Models\User;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class TagController
 *
 * RESTful endpoint handler for user task tags.
 */
class TagController extends Controller
{
    /**
     * TagController constructor.
     */
    public function __construct(
        protected TagService $tagService
    ) {}

    /**
     * Display a listing of tags belonging to the user.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tags = $this->tagService->getTags($user);

        return response()->json([
            'success' => true,
            'data' => TagResource::collection($tags),
        ]);
    }

    /**
     * Store a newly created tag in storage.
     */
    public function store(CreateTagRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tag = $this->tagService->createTag($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tag created successfully.',
            'data' => new TagResource($tag),
        ], Response::HTTP_CREATED);
    }

    /**
     * Remove the specified tag from storage.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        Gate::authorize('delete', $tag);

        $this->tagService->deleteTag($tag);

        return response()->json([
            'success' => true,
            'message' => 'Tag deleted successfully.',
        ]);
    }
}
