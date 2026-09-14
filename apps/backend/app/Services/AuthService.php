<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

/**
 * Class AuthService
 *
 * Manages user authentication lifecycle, registration, and JWT token issuance.
 */
class AuthService
{
    /**
     * Register a new user and generate an initial JWT authentication token.
     *
     * @param  array{name: string, email: string, password: string}  $data  Validated user registration credentials.
     * @return array{user: User, token: string, token_type: string, expires_in: int}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        /** @var string $token */
        $token = JWTAuth::fromUser($user);

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $this->getTtlInSeconds(),
        ];
    }

    /**
     * Authenticate credentials and generate a JWT token.
     *
     * @param  array{email: string, password: string}  $credentials  User login credentials.
     * @return array{user: User, token: string, token_type: string, expires_in: int}|null Null if authentication fails.
     */
    public function login(array $credentials): ?array
    {
        /** @var string|false $token */
        $token = auth('api')->attempt($credentials);

        if (! $token) {
            return null;
        }

        /** @var User $user */
        $user = auth('api')->user();

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $this->getTtlInSeconds(),
        ];
    }

    /**
     * Refresh an existing JWT token.
     *
     * @return array{token: string, token_type: string, expires_in: int}
     */
    public function refreshToken(): array
    {
        /** @var string $token */
        $token = auth('api')->refresh();

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $this->getTtlInSeconds(),
        ];
    }

    /**
     * Invalidate the currently active JWT token (logout).
     */
    public function logout(): void
    {
        auth('api')->logout();
    }

    /**
     * Retrieve the currently authenticated user.
     */
    public function me(): ?User
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        return $user;
    }

    /**
     * Retrieve the token TTL in seconds from JWT config.
     */
    protected function getTtlInSeconds(): int
    {
        $ttlMinutes = (int) config('jwt.ttl', 60);

        return $ttlMinutes * 60;
    }
}
