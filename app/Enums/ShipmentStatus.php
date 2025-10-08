<?php

namespace App\Enums;

/**
 * Enum ShipmentStatus
 * Gerencia todos os status do workflow de importação (7 fases)
 * Baseado no SRS do Logistica Pro
 */
enum ShipmentStatus: string
{
    // ===== FASE 1: COLETA DE DISPERSA =====
    case COLETA_COTACAO_SOLICITADA = 'coleta_cotacao_solicitada';
    case COLETA_COTACAO_RECEBIDA = 'coleta_cotacao_recebida';
    case COLETA_PAGAMENTO_ENVIADO = 'coleta_pagamento_enviado';
    case COLETA_RECIBO_RECEBIDO = 'coleta_recibo_recebido';
    case COLETA_CONCLUIDA = 'coleta_concluida';

    // ===== FASE 2: LEGALIZAÇÃO =====
    case LEGALIZACAO_INICIADA = 'legalizacao_iniciada';
    case LEGALIZACAO_BL_CARIMBADO = 'legalizacao_bl_carimbado';
    case LEGALIZACAO_DO_RECEBIDA = 'legalizacao_do_recebida';
    case LEGALIZACAO_CONCLUIDA = 'legalizacao_concluida';

    // ===== FASE 3: ALFÂNDEGAS =====
    case ALFANDEGAS_DECLARACAO_SUBMETIDA = 'alfandegas_declaracao_submetida';
    case ALFANDEGAS_AVISO_RECEBIDO = 'alfandegas_aviso_recebido';
    case ALFANDEGAS_PAGAMENTO_EFECTUADO = 'alfandegas_pagamento_efectuado';
    case ALFANDEGAS_AUTORIZACAO_RECEBIDA = 'alfandegas_autorizacao_recebida';
    case ALFANDEGAS_CONCLUIDA = 'alfandegas_concluida';

    // ===== FASE 4: CORNELDER (DESPESAS DE MANUSEAMENTO) =====
    case CORNELDER_COTACAO_SOLICITADA = 'cornelder_cotacao_solicitada';
    case CORNELDER_DRAFT_RECEBIDO = 'cornelder_draft_recebido';
    case CORNELDER_PAGAMENTO_EFECTUADO = 'cornelder_pagamento_efectuado';
    case CORNELDER_RECIBO_RECEBIDO = 'cornelder_recibo_recebido';
    case CORNELDER_CONCLUIDA = 'cornelder_concluida';

    // ===== FASE 5: TAXAÇÃO =====
    case TAXACAO_DOCUMENTOS_CONSOLIDADOS = 'taxacao_documentos_consolidados';
    case TAXACAO_CONCLUIDA = 'taxacao_concluida';

    // ===== FASE 6: FATURAÇÃO =====
    case FATURACAO_EM_PREPARACAO = 'faturacao_em_preparacao';
    case FATURACAO_EMITIDA = 'faturacao_emitida';
    case FATURACAO_PAGA = 'faturacao_paga';

    // ===== FASE 7: POD (PROOF OF DELIVERY) =====
    case POD_AGUARDANDO = 'pod_aguardando';
    case POD_RECEBIDO = 'pod_recebido';
    case PROCESSO_CONCLUIDO = 'processo_concluido';

    /**
     * Retorna labels legíveis para cada status
     */
    public static function labels(): array
    {
        return [
            // Fase 1
            self::COLETA_COTACAO_SOLICITADA->value => 'Cotação Solicitada',
            self::COLETA_COTACAO_RECEBIDA->value => 'Cotação Recebida',
            self::COLETA_PAGAMENTO_ENVIADO->value => 'Pagamento Enviado',
            self::COLETA_RECIBO_RECEBIDO->value => 'Recibo Recebido',
            self::COLETA_CONCLUIDA->value => 'Fase 1 Concluída',

            // Fase 2
            self::LEGALIZACAO_INICIADA->value => 'Legalização Iniciada',
            self::LEGALIZACAO_BL_CARIMBADO->value => 'BL Carimbado',
            self::LEGALIZACAO_DO_RECEBIDA->value => 'Delivery Order Recebida',
            self::LEGALIZACAO_CONCLUIDA->value => 'Fase 2 Concluída',

            // Fase 3
            self::ALFANDEGAS_DECLARACAO_SUBMETIDA->value => 'Declaração Submetida',
            self::ALFANDEGAS_AVISO_RECEBIDO->value => 'Aviso Recebido',
            self::ALFANDEGAS_PAGAMENTO_EFECTUADO->value => 'Pagamento Efectuado',
            self::ALFANDEGAS_AUTORIZACAO_RECEBIDA->value => 'Autorização Recebida',
            self::ALFANDEGAS_CONCLUIDA->value => 'Fase 3 Concluída',

            // Fase 4
            self::CORNELDER_COTACAO_SOLICITADA->value => 'Cotação Solicitada',
            self::CORNELDER_DRAFT_RECEBIDO->value => 'Draft Recebido',
            self::CORNELDER_PAGAMENTO_EFECTUADO->value => 'Pagamento Efectuado',
            self::CORNELDER_RECIBO_RECEBIDO->value => 'Recibo Recebido',
            self::CORNELDER_CONCLUIDA->value => 'Fase 4 Concluída',

            // Fase 5
            self::TAXACAO_DOCUMENTOS_CONSOLIDADOS->value => 'Documentos Consolidados',
            self::TAXACAO_CONCLUIDA->value => 'Fase 5 Concluída',

            // Fase 6
            self::FATURACAO_EM_PREPARACAO->value => 'Factura em Preparação',
            self::FATURACAO_EMITIDA->value => 'Factura Emitida',
            self::FATURACAO_PAGA->value => 'Factura Paga',

            // Fase 7
            self::POD_AGUARDANDO->value => 'Aguardando POD',
            self::POD_RECEBIDO->value => 'POD Recebido',
            self::PROCESSO_CONCLUIDO->value => 'Processo Concluído',
        ];
    }

    /**
     * Retorna a fase (1-7) baseado no status
     */
    public static function getPhase(string $status): int
    {
        $phases = [
            1 => [
                self::COLETA_COTACAO_SOLICITADA->value,
                self::COLETA_COTACAO_RECEBIDA->value,
                self::COLETA_PAGAMENTO_ENVIADO->value,
                self::COLETA_RECIBO_RECEBIDO->value,
                self::COLETA_CONCLUIDA->value,
            ],
            2 => [
                self::LEGALIZACAO_INICIADA->value,
                self::LEGALIZACAO_BL_CARIMBADO->value,
                self::LEGALIZACAO_DO_RECEBIDA->value,
                self::LEGALIZACAO_CONCLUIDA->value,
            ],
            3 => [
                self::ALFANDEGAS_DECLARACAO_SUBMETIDA->value,
                self::ALFANDEGAS_AVISO_RECEBIDO->value,
                self::ALFANDEGAS_PAGAMENTO_EFECTUADO->value,
                self::ALFANDEGAS_AUTORIZACAO_RECEBIDA->value,
                self::ALFANDEGAS_CONCLUIDA->value,
            ],
            4 => [
                self::CORNELDER_COTACAO_SOLICITADA->value,
                self::CORNELDER_DRAFT_RECEBIDO->value,
                self::CORNELDER_PAGAMENTO_EFECTUADO->value,
                self::CORNELDER_RECIBO_RECEBIDO->value,
                self::CORNELDER_CONCLUIDA->value,
            ],
            5 => [
                self::TAXACAO_DOCUMENTOS_CONSOLIDADOS->value,
                self::TAXACAO_CONCLUIDA->value,
            ],
            6 => [
                self::FATURACAO_EM_PREPARACAO->value,
                self::FATURACAO_EMITIDA->value,
                self::FATURACAO_PAGA->value,
            ],
            7 => [
                self::POD_AGUARDANDO->value,
                self::POD_RECEBIDO->value,
                self::PROCESSO_CONCLUIDO->value,
            ],
        ];

        foreach ($phases as $phase => $statuses) {
            if (in_array($status, $statuses)) {
                return $phase;
            }
        }

        return 1; // Default para fase 1
    }

    /**
     * Retorna todos os status de uma fase específica
     */
    public static function getPhaseStatuses(int $phase): array
    {
        $allPhases = [
            1 => [
                self::COLETA_COTACAO_SOLICITADA,
                self::COLETA_COTACAO_RECEBIDA,
                self::COLETA_PAGAMENTO_ENVIADO,
                self::COLETA_RECIBO_RECEBIDO,
                self::COLETA_CONCLUIDA,
            ],
            2 => [
                self::LEGALIZACAO_INICIADA,
                self::LEGALIZACAO_BL_CARIMBADO,
                self::LEGALIZACAO_DO_RECEBIDA,
                self::LEGALIZACAO_CONCLUIDA,
            ],
            3 => [
                self::ALFANDEGAS_DECLARACAO_SUBMETIDA,
                self::ALFANDEGAS_AVISO_RECEBIDO,
                self::ALFANDEGAS_PAGAMENTO_EFECTUADO,
                self::ALFANDEGAS_AUTORIZACAO_RECEBIDA,
                self::ALFANDEGAS_CONCLUIDA,
            ],
            4 => [
                self::CORNELDER_COTACAO_SOLICITADA,
                self::CORNELDER_DRAFT_RECEBIDO,
                self::CORNELDER_PAGAMENTO_EFECTUADO,
                self::CORNELDER_RECIBO_RECEBIDO,
                self::CORNELDER_CONCLUIDA,
            ],
            5 => [
                self::TAXACAO_DOCUMENTOS_CONSOLIDADOS,
                self::TAXACAO_CONCLUIDA,
            ],
            6 => [
                self::FATURACAO_EM_PREPARACAO,
                self::FATURACAO_EMITIDA,
                self::FATURACAO_PAGA,
            ],
            7 => [
                self::POD_AGUARDANDO,
                self::POD_RECEBIDO,
                self::PROCESSO_CONCLUIDO,
            ],
        ];

        return $allPhases[$phase] ?? [];
    }

    /**
     * Retorna o próximo status no workflow
     */
    public static function getNextStatus(string $current): ?string
    {
        $workflow = [
            // Fase 1
            self::COLETA_COTACAO_SOLICITADA->value => self::COLETA_COTACAO_RECEBIDA->value,
            self::COLETA_COTACAO_RECEBIDA->value => self::COLETA_PAGAMENTO_ENVIADO->value,
            self::COLETA_PAGAMENTO_ENVIADO->value => self::COLETA_RECIBO_RECEBIDO->value,
            self::COLETA_RECIBO_RECEBIDO->value => self::COLETA_CONCLUIDA->value,
            self::COLETA_CONCLUIDA->value => self::LEGALIZACAO_INICIADA->value,

            // Fase 2
            self::LEGALIZACAO_INICIADA->value => self::LEGALIZACAO_BL_CARIMBADO->value,
            self::LEGALIZACAO_BL_CARIMBADO->value => self::LEGALIZACAO_DO_RECEBIDA->value,
            self::LEGALIZACAO_DO_RECEBIDA->value => self::LEGALIZACAO_CONCLUIDA->value,
            self::LEGALIZACAO_CONCLUIDA->value => self::ALFANDEGAS_DECLARACAO_SUBMETIDA->value,

            // Fase 3
            self::ALFANDEGAS_DECLARACAO_SUBMETIDA->value => self::ALFANDEGAS_AVISO_RECEBIDO->value,
            self::ALFANDEGAS_AVISO_RECEBIDO->value => self::ALFANDEGAS_PAGAMENTO_EFECTUADO->value,
            self::ALFANDEGAS_PAGAMENTO_EFECTUADO->value => self::ALFANDEGAS_AUTORIZACAO_RECEBIDA->value,
            self::ALFANDEGAS_AUTORIZACAO_RECEBIDA->value => self::ALFANDEGAS_CONCLUIDA->value,
            self::ALFANDEGAS_CONCLUIDA->value => self::CORNELDER_COTACAO_SOLICITADA->value,

            // Fase 4
            self::CORNELDER_COTACAO_SOLICITADA->value => self::CORNELDER_DRAFT_RECEBIDO->value,
            self::CORNELDER_DRAFT_RECEBIDO->value => self::CORNELDER_PAGAMENTO_EFECTUADO->value,
            self::CORNELDER_PAGAMENTO_EFECTUADO->value => self::CORNELDER_RECIBO_RECEBIDO->value,
            self::CORNELDER_RECIBO_RECEBIDO->value => self::CORNELDER_CONCLUIDA->value,
            self::CORNELDER_CONCLUIDA->value => self::TAXACAO_DOCUMENTOS_CONSOLIDADOS->value,

            // Fase 5
            self::TAXACAO_DOCUMENTOS_CONSOLIDADOS->value => self::TAXACAO_CONCLUIDA->value,
            self::TAXACAO_CONCLUIDA->value => self::FATURACAO_EM_PREPARACAO->value,

            // Fase 6
            self::FATURACAO_EM_PREPARACAO->value => self::FATURACAO_EMITIDA->value,
            self::FATURACAO_EMITIDA->value => self::FATURACAO_PAGA->value,
            self::FATURACAO_PAGA->value => self::POD_AGUARDANDO->value,

            // Fase 7
            self::POD_AGUARDANDO->value => self::POD_RECEBIDO->value,
            self::POD_RECEBIDO->value => self::PROCESSO_CONCLUIDO->value,
            self::PROCESSO_CONCLUIDO->value => null,
        ];

        return $workflow[$current] ?? null;
    }

    /**
     * Verifica se pode transicionar de um status para outro
     */
    public static function canTransition(string $from, string $to): bool
    {
        $nextStatus = self::getNextStatus($from);
        return $nextStatus === $to;
    }

    /**
     * Retorna cores para cada status (Tailwind CSS)
     */
    public static function colors(): array
    {
        return [
            // Fase 1 - Azul
            self::COLETA_COTACAO_SOLICITADA->value => 'blue',
            self::COLETA_COTACAO_RECEBIDA->value => 'blue',
            self::COLETA_PAGAMENTO_ENVIADO->value => 'blue',
            self::COLETA_RECIBO_RECEBIDO->value => 'blue',
            self::COLETA_CONCLUIDA->value => 'green',

            // Fase 2 - Roxo
            self::LEGALIZACAO_INICIADA->value => 'purple',
            self::LEGALIZACAO_BL_CARIMBADO->value => 'purple',
            self::LEGALIZACAO_DO_RECEBIDA->value => 'purple',
            self::LEGALIZACAO_CONCLUIDA->value => 'green',

            // Fase 3 - Índigo
            self::ALFANDEGAS_DECLARACAO_SUBMETIDA->value => 'indigo',
            self::ALFANDEGAS_AVISO_RECEBIDO->value => 'indigo',
            self::ALFANDEGAS_PAGAMENTO_EFECTUADO->value => 'indigo',
            self::ALFANDEGAS_AUTORIZACAO_RECEBIDA->value => 'indigo',
            self::ALFANDEGAS_CONCLUIDA->value => 'green',

            // Fase 4 - Laranja
            self::CORNELDER_COTACAO_SOLICITADA->value => 'orange',
            self::CORNELDER_DRAFT_RECEBIDO->value => 'orange',
            self::CORNELDER_PAGAMENTO_EFECTUADO->value => 'orange',
            self::CORNELDER_RECIBO_RECEBIDO->value => 'orange',
            self::CORNELDER_CONCLUIDA->value => 'green',

            // Fase 5 - Rosa
            self::TAXACAO_DOCUMENTOS_CONSOLIDADOS->value => 'pink',
            self::TAXACAO_CONCLUIDA->value => 'green',

            // Fase 6 - Verde
            self::FATURACAO_EM_PREPARACAO->value => 'emerald',
            self::FATURACAO_EMITIDA->value => 'emerald',
            self::FATURACAO_PAGA->value => 'green',

            // Fase 7 - Cinza escuro
            self::POD_AGUARDANDO->value => 'slate',
            self::POD_RECEBIDO->value => 'slate',
            self::PROCESSO_CONCLUIDO->value => 'green',
        ];
    }

    /**
     * Retorna nome da fase
     */
    public static function getPhaseName(int $phase): string
    {
        $phases = [
            1 => 'Coleta de Dispersa',
            2 => 'Legalização',
            3 => 'Alfândegas',
            4 => 'Cornelder (Despesas)',
            5 => 'Taxação',
            6 => 'Faturação',
            7 => 'POD (Entrega)',
        ];

        return $phases[$phase] ?? 'Desconhecida';
    }

    /**
     * Verifica se é um status de conclusão de fase
     */
    public function isPhaseCompleted(): bool
    {
        return in_array($this, [
            self::COLETA_CONCLUIDA,
            self::LEGALIZACAO_CONCLUIDA,
            self::ALFANDEGAS_CONCLUIDA,
            self::CORNELDER_CONCLUIDA,
            self::TAXACAO_CONCLUIDA,
            self::PROCESSO_CONCLUIDO,
        ]);
    }

    /**
     * Verifica se o processo está completamente concluído
     */
    public function isFullyCompleted(): bool
    {
        return $this === self::PROCESSO_CONCLUIDO;
    }
}
