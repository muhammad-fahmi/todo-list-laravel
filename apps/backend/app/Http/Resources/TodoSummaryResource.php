<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class TodoSummaryResource
 *
 * Formats aggregated dashboard statistics for user tasks.
 */
class TodoSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total' => $this->resource['total'],
            'completed' => $this->resource['completed'],
            'pending' => $this->resource['pending'],
            'in_progress' => $this->resource['in_progress'],
            'overdue' => $this->resource['overdue'],
            'urgent_count' => $this->resource['urgent_count'],
            'completion_rate' => $this->resource['completion_rate'],
        ];
    }
}
