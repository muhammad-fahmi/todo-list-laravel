<?php

declare(strict_types=1);

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Http\Controllers\Api\v1\TagController;
use App\Http\Controllers\Api\v1\TodoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Authentication Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    // Authenticated API Endpoints (JWT Protected)
    Route::middleware('auth:api')->group(function () {
        // Authenticated Session Operations
        Route::prefix('auth')->group(function () {
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });

        // Todo Tasks Endpoints
        Route::get('todos/summary', [TodoController::class, 'summary']);
        Route::patch('todos/{todo}/toggle', [TodoController::class, 'toggle']);
        Route::apiResource('todos', TodoController::class);

        // Categories Endpoints
        Route::apiResource('categories', CategoryController::class)->except(['show']);

        // Tags Endpoints
        Route::apiResource('tags', TagController::class)->only(['index', 'store', 'destroy']);
    });
});
