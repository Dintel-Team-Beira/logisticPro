<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'exchange:update {--force : Force update even if recently updated}';

    /**
     * The console command description.
     */
    protected $description = 'Update exchange rates from external API';

    /**
     * Moedas principais para importação/exportação
     */
    protected $currencies = [
        'USD', // Dólar Americano - Principal
        'EUR', // Euro - Europa
        'ZAR', // Rand - África do Sul
        'GBP', // Libra - Reino Unido
        'CNY', // Yuan - China
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Atualizando taxas de câmbio...');

        // Verificar se já atualizou recentemente (a não ser que force)
        if (!$this->option('force') && Cache::has('exchange_rates_last_update')) {
            $lastUpdate = Cache::get('exchange_rates_last_update');
            $minutesAgo = now()->diffInMinutes($lastUpdate);

            if ($minutesAgo < 30) {
                $this->warn("⏳ Taxas atualizadas há {$minutesAgo} minutos. Use --force para forçar atualização.");
                return 0;
            }
        }

        try {
            // Buscar taxas da API (ExchangeRate-API - Gratuita)
            $response = Http::timeout(10)->get('https://api.exchangerate-api.com/v4/latest/MZN');

            if (!$response->successful()) {
                $this->error('❌ Erro ao buscar taxas da API');
                Log::error('Exchange Rate API Error', ['status' => $response->status()]);
                return 1;
            }

            $data = $response->json();
            $baseCurrency = 'MZN';

            $this->info("📡 Dados recebidos da API");

            // Processar cada moeda
            foreach ($this->currencies as $currency) {
                if (!isset($data['rates'][$currency])) {
                    $this->warn("⚠️  Taxa para {$currency} não encontrada");
                    continue;
                }

                // Converter: se API retorna MZN base, precisamos inverter
                // 1 MZN = X USD, então 1 USD = 1/X MZN
                $rateFromApi = $data['rates'][$currency];
                $rate = 1 / $rateFromApi; // Inverter para ter FROM_CURRENCY -> MZN

                // Buscar taxa anterior para calcular variação
                $previousRate = ExchangeRate::where('from_currency', $currency)
                    ->where('to_currency', $baseCurrency)
                    ->latest('fetched_at')
                    ->first();

                $changePercentage = null;
                if ($previousRate) {
                    $changePercentage = (($rate - $previousRate->rate) / $previousRate->rate) * 100;
                }

                // Criar novo registro
                ExchangeRate::create([
                    'from_currency' => $currency,
                    'to_currency' => $baseCurrency,
                    'rate' => round($rate, 6),
                    'previous_rate' => $previousRate?->rate,
                    'change_percentage' => $changePercentage ? round($changePercentage, 4) : 0,
                    'fetched_at' => now(),
                    'source' => 'exchangerate-api',
                ]);

                $arrow = $changePercentage > 0 ? '↗' : ($changePercentage < 0 ? '↘' : '→');
                $this->info("  ✓ {$currency}: " . number_format($rate, 2) . " MZN {$arrow} " . number_format(abs($changePercentage ?? 0), 2) . "%");
            }

            // Limpar cache para forçar atualização
            Cache::forget('exchange_rates_latest_MZN');
            foreach ($this->currencies as $currency) {
                Cache::forget("exchange_rate_{$currency}_MZN");
            }

            // Marcar última atualização
            Cache::put('exchange_rates_last_update', now(), 3600);

            $this->info('✅ Taxas de câmbio atualizadas com sucesso!');
            $this->info('⏰ Próxima atualização em 30 minutos');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Erro: ' . $e->getMessage());
            Log::error('Exchange Rate Update Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }
    }
}
