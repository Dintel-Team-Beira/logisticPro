<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'category',
        'description',
        'amount',
        'spent',
        'year',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'spent' => 'decimal:2',
    ];

    // Calcular percentual usado
    public function getPercentageAttribute()
    {
        if ($this->amount == 0) return 0;
        return round(($this->spent / $this->amount) * 100, 2);
    }

    // Calcular restante
    public function getRemainingAttribute()
    {
        return $this->amount - $this->spent;
    }
}
