<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AuthController
 *
 * Handles registration, JWT authentication, session checks, and logout.
 */
class AuthController extends Controller
{
    /**
     * AuthController constructor.
     */
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Register a new user account and issue a JWT token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully.',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_in' => $result['expires_in'],
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * Authenticate credentials and return a JWT bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        if (! $result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password credentials.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json([
            'success' => true,
            'message' => 'Authenticated successfully.',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_in' => $result['expires_in'],
            ],
        ]);
    }

    /**
     * Refresh the current JWT authentication token.
     */
    public function refresh(): JsonResponse
    {
        $result = $this->authService->refreshToken();

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed successfully.',
            'data' => $result,
        ]);
    }

    /**
     * Invalidate the current JWT token and terminate the session.
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }
}
