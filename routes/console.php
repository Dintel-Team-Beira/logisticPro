<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule to check overdue invoices daily at 9 AM
Schedule::command('invoices:check-overdue')
    ->dailyAt('09:00')
    ->timezone('Africa/Maputo')
    ->onSuccess(function () {
        \Log::info('Overdue invoices check completed successfully');
    })
    ->onFailure(function () {
        \Log::error('Overdue invoices check failed');
    });

// Schedule to update exchange rates every 30 minutes
Schedule::command('exchange:update')
    ->everyThirtyMinutes()
    ->timezone('Africa/Maputo')
    ->onSuccess(function () {
        \Log::info('Exchange rates updated successfully');
    })
    ->onFailure(function () {
        \Log::error('Exchange rates update failed');
    });
