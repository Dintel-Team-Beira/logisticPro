<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Document
 * Representa documentos anexados aos shipments
 */
class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'shipment_id',
        'type',
        'name',
        'path',
        'size',
        'uploaded_by',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Relacionamento com Shipment
     */
    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Relacionamento com User (uploader)
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Accessor para URL do documento
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }

    /**
     * Accessor para tamanho formatado
     */
    public function getFormattedSizeAttribute()
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        $unit = 0;

        while ($size > 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }
}
