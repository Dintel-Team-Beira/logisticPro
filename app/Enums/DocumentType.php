<?php

namespace App\Enums;

/**
 * Enum DocumentType
 * Define todos os tipos de documentos usados no processo de importação
 * Baseado no SRS do Logistica Pro
 */
enum DocumentType: string
{
    // ===== DOCUMENTOS GERAIS =====
    case BL_ORIGINAL = 'bl_original';
    case BL_CARIMBADO = 'bl_carimbado';
    case CARTA_ENDOSSO = 'carta_endosso';

    // ===== FASE 1: COLETA DE DISPERSA =====
    case COTACAO_LINHA = 'cotacao_linha';
    case FATURA_LINHA = 'fatura_linha';
    case POP_COLETA = 'pop_coleta'; // Proof of Payment
    case RECIBO_LINHA = 'recibo_linha';

    // ===== FASE 2: LEGALIZAÇÃO =====
    case DELIVERY_ORDER = 'delivery_order';

    // ===== FASE 3: ALFÂNDEGAS =====
    case PACKING_LIST = 'packing_list';
    case COMMERCIAL_INVOICE = 'commercial_invoice';
    case AVISO_TAXACAO = 'aviso_taxacao';
    case POP_ALFANDEGAS = 'pop_alfandegas';
    case AUTORIZACAO_SAIDA = 'autorizacao_saida';

    // ===== FASE 4: CORNELDER =====
    case COTACAO_CORNELDER = 'cotacao_cornelder';
    case DRAFT_CORNELDER = 'draft_cornelder';
    case STORAGE = 'storage';
    case POP_CORNELDER = 'pop_cornelder';
    case RECIBO_CORNELDER = 'recibo_cornelder';
    case TERMO_LINHA = 'termo_linha';

    // ===== FASE 5: TAXAÇÃO =====
    case IDO = 'ido'; // Interchange Delivery Order
    case SAD = 'sad'; // Single Administrative Document
    case CARTA_PORTE = 'carta_porte';

    // ===== FASE 6: FATURAÇÃO =====
    case FACTURA_CLIENTE = 'factura_cliente';
    case POP_CLIENTE = 'pop_cliente';

    // ===== FASE 7: POD =====
    case POD = 'pod'; // Proof of Delivery
    case ASSINATURA_CLIENTE = 'assinatura_cliente';

    // ===== OUTROS =====
    case OUTRO = 'outro';

    /**
     * Retorna labels descritivos para cada tipo de documento
     */
    public static function labels(): array
    {
        return [
            // Gerais
            self::BL_ORIGINAL->value => 'Bill of Lading Original',
            self::BL_CARIMBADO->value => 'BL Carimbado',
            self::CARTA_ENDOSSO->value => 'Carta de Endosso',

            // Fase 1
            self::COTACAO_LINHA->value => 'Cotação da Linha',
            self::FATURA_LINHA->value => 'Factura da Linha',
            self::POP_COLETA->value => 'Comprovativo de Pagamento (Coleta)',
            self::RECIBO_LINHA->value => 'Recibo da Linha',

            // Fase 2
            self::DELIVERY_ORDER->value => 'Delivery Order',

            // Fase 3
            self::PACKING_LIST->value => 'Packing List',
            self::COMMERCIAL_INVOICE->value => 'Commercial Invoice',
            self::AVISO_TAXACAO->value => 'Aviso de Taxação',
            self::POP_ALFANDEGAS->value => 'Comprovativo de Pagamento (Alfândegas)',
            self::AUTORIZACAO_SAIDA->value => 'Autorização de Saída',

            // Fase 4
            self::COTACAO_CORNELDER->value => 'Cotação Cornelder',
            self::DRAFT_CORNELDER->value => 'Draft Cornelder',
            self::STORAGE->value => 'Storage',
            self::POP_CORNELDER->value => 'Comprovativo de Pagamento (Cornelder)',
            self::RECIBO_CORNELDER->value => 'Recibo Cornelder',
            self::TERMO_LINHA->value => 'Termo da Linha',

            // Fase 5
            self::IDO->value => 'IDO (Interchange Delivery Order)',
            self::SAD->value => 'SAD (Documento de Trânsito)',
            self::CARTA_PORTE->value => 'Carta de Porte',

            // Fase 6
            self::FACTURA_CLIENTE->value => 'Factura ao Cliente',
            self::POP_CLIENTE->value => 'Comprovativo de Pagamento (Cliente)',

            // Fase 7
            self::POD->value => 'Proof of Delivery',
            self::ASSINATURA_CLIENTE->value => 'Comprovativo de Entrega Assinado',

            // Outros
            self::OUTRO->value => 'Outro Documento',
        ];
    }

    /**
     * Retorna a fase onde o documento é usado (1-7)
     */
    public static function getPhase(string $type): int
    {
        $phases = [
            0 => [ // Documentos que podem ser usados em múltiplas fases
                self::BL_ORIGINAL->value,
                self::BL_CARIMBADO->value,
                self::CARTA_ENDOSSO->value,
                self::OUTRO->value,
            ],
            1 => [
                self::COTACAO_LINHA->value,
                self::FATURA_LINHA->value,
                self::POP_COLETA->value,
                self::RECIBO_LINHA->value,
            ],
            2 => [
                self::DELIVERY_ORDER->value,
            ],
            3 => [
                self::PACKING_LIST->value,
                self::COMMERCIAL_INVOICE->value,
                self::AVISO_TAXACAO->value,
                self::POP_ALFANDEGAS->value,
                self::AUTORIZACAO_SAIDA->value,
            ],
            4 => [
                self::COTACAO_CORNELDER->value,
                self::DRAFT_CORNELDER->value,
                self::STORAGE->value,
                self::POP_CORNELDER->value,
                self::RECIBO_CORNELDER->value,
                self::TERMO_LINHA->value,
            ],
            5 => [
                self::IDO->value,
                self::SAD->value,
                self::CARTA_PORTE->value,
            ],
            6 => [
                self::FACTURA_CLIENTE->value,
                self::POP_CLIENTE->value,
            ],
            7 => [
                self::POD->value,
                self::ASSINATURA_CLIENTE->value,
            ],
        ];

        foreach ($phases as $phase => $types) {
            if (in_array($type, $types)) {
                return $phase;
            }
        }

        return 0;
    }

    /**
     * Verifica se o documento é obrigatório para uma fase específica
     */
    public static function isRequired(string $type, int $phase): bool
    {
        $required = [
            1 => [
                self::BL_ORIGINAL->value,
                self::FATURA_LINHA->value,
                self::POP_COLETA->value,
                self::RECIBO_LINHA->value,
                self::CARTA_ENDOSSO->value,
            ],
            2 => [
                self::BL_CARIMBADO->value,
                self::DELIVERY_ORDER->value,
            ],
            3 => [
                self::PACKING_LIST->value,
                self::COMMERCIAL_INVOICE->value,
                self::AVISO_TAXACAO->value,
                self::POP_ALFANDEGAS->value,
                self::AUTORIZACAO_SAIDA->value,
            ],
            4 => [
                self::DRAFT_CORNELDER->value,
                self::STORAGE->value,
                self::POP_CORNELDER->value,
                self::RECIBO_CORNELDER->value,
            ],
            5 => [
                self::IDO->value,
                self::CARTA_PORTE->value,
            ],
            6 => [
                self::FACTURA_CLIENTE->value,
            ],
            7 => [
                self::POD->value,
            ],
        ];

        return in_array($type, $required[$phase] ?? []);
    }

    /**
     * Retorna ícones para cada tipo de documento (Lucide React)
     */
    public static function icons(): array
    {
        return [
            // Gerais
            self::BL_ORIGINAL->value => 'FileText',
            self::BL_CARIMBADO->value => 'FileBadge',
            self::CARTA_ENDOSSO->value => 'FileSignature',

            // Fase 1
            self::COTACAO_LINHA->value => 'FileSearch',
            self::FATURA_LINHA->value => 'Receipt',
            self::POP_COLETA->value => 'CreditCard',
            self::RECIBO_LINHA->value => 'FileCheck',

            // Fase 2
            self::DELIVERY_ORDER->value => 'Truck',

            // Fase 3
            self::PACKING_LIST->value => 'PackageCheck',
            self::COMMERCIAL_INVOICE->value => 'FileSpreadsheet',
            self::AVISO_TAXACAO->value => 'Bell',
            self::POP_ALFANDEGAS->value => 'Wallet',
            self::AUTORIZACAO_SAIDA->value => 'ShieldCheck',

            // Fase 4
            self::COTACAO_CORNELDER->value => 'Calculator',
            self::DRAFT_CORNELDER->value => 'FileEdit',
            self::STORAGE->value => 'Warehouse',
            self::POP_CORNELDER->value => 'DollarSign',
            self::RECIBO_CORNELDER->value => 'CheckCircle',
            self::TERMO_LINHA->value => 'FileContract',

            // Fase 5
            self::IDO->value => 'FileKey',
            self::SAD->value => 'FileBarChart',
            self::CARTA_PORTE->value => 'MapPin',

            // Fase 6
            self::FACTURA_CLIENTE->value => 'FileText',
            self::POP_CLIENTE->value => 'BadgeCheck',

            // Fase 7
            self::POD->value => 'PackageCheck',
            self::ASSINATURA_CLIENTE->value => 'PenTool',

            // Outros
            self::OUTRO->value => 'File',
        ];
    }

    /**
     * Retorna extensões permitidas para cada tipo de documento
     */
    public static function allowedExtensions(string $type): array
    {
        // Documentos que só aceitam PDF
        $pdfOnly = [
            self::FACTURA_CLIENTE->value,
            self::FATURA_LINHA->value,
            self::DRAFT_CORNELDER->value,
        ];

        if (in_array($type, $pdfOnly)) {
            return ['pdf'];
        }

        // Documentos que aceitam imagens assinadas
        $withSignature = [
            self::ASSINATURA_CLIENTE->value,
            self::POD->value,
        ];

        if (in_array($type, $withSignature)) {
            return ['pdf', 'jpg', 'jpeg', 'png'];
        }

        // Por padrão, aceita PDF e imagens
        return ['pdf', 'jpg', 'jpeg', 'png'];
    }

    /**
     * Retorna tamanho máximo do arquivo em MB
     */
    public static function maxFileSize(string $type): int
    {
        // Documentos grandes (até 20MB)
        $large = [
            self::BL_ORIGINAL->value,
            self::BL_CARIMBADO->value,
        ];

        if (in_array($type, $large)) {
            return 20;
        }

        // Padrão: 10MB
        return 10;
    }

    /**
     * Retorna descrição/ajuda para o tipo de documento
     */
    public static function getDescription(string $type): string
    {
        $descriptions = [
            self::BL_ORIGINAL->value => 'Documento original recebido da linha de navegação',
            self::BL_CARIMBADO->value => 'BL após carimbo da linha de navegação',
            self::CARTA_ENDOSSO->value => 'Documento que transfere propriedade da carga',
            self::COTACAO_LINHA->value => 'Cotação de custos da linha de navegação',
            self::FATURA_LINHA->value => 'Factura emitida pela linha de navegação',
            self::POP_COLETA->value => 'Comprovativo de pagamento à linha',
            self::RECIBO_LINHA->value => 'Recibo emitido pela linha após pagamento',
            self::DELIVERY_ORDER->value => 'Ordem de retirada do contentor',
            self::PACKING_LIST->value => 'Lista detalhada do conteúdo da carga',
            self::COMMERCIAL_INVOICE->value => 'Factura comercial internacional',
            self::AVISO_TAXACAO->value => 'Aviso de taxas das alfândegas',
            self::POP_ALFANDEGAS->value => 'Comprovativo de pagamento às alfândegas',
            self::AUTORIZACAO_SAIDA->value => 'Autorização das alfândegas para retirada',
            self::COTACAO_CORNELDER->value => 'Cotação de despesas de manuseamento',
            self::DRAFT_CORNELDER->value => 'Draft emitido pela Cornelder',
            self::STORAGE->value => 'Documento de armazenamento no porto',
            self::POP_CORNELDER->value => 'Comprovativo de pagamento à Cornelder',
            self::RECIBO_CORNELDER->value => 'Recibo da Cornelder',
            self::TERMO_LINHA->value => 'Termo emitido pela linha de navegação',
            self::IDO->value => 'Ordem de intercâmbio de entrega',
            self::SAD->value => 'Documento administrativo único para trânsito',
            self::CARTA_PORTE->value => 'Documento de carregamento para motorista',
            self::FACTURA_CLIENTE->value => 'Factura emitida ao cliente final',
            self::POP_CLIENTE->value => 'Comprovativo de pagamento do cliente',
            self::POD->value => 'Comprovativo de entrega da mercadoria',
            self::ASSINATURA_CLIENTE->value => 'Documento assinado pelo cliente confirmando recebimento',
            self::OUTRO->value => 'Outro documento relacionado ao processo',
        ];

        return $descriptions[$type] ?? '';
    }

    /**
     * Verifica se é um documento financeiro (requer valor)
     */
    public function isFinancial(): bool
    {
        return in_array($this, [
            self::FATURA_LINHA,
            self::POP_COLETA,
            self::RECIBO_LINHA,
            self::POP_ALFANDEGAS,
            self::DRAFT_CORNELDER,
            self::POP_CORNELDER,
            self::RECIBO_CORNELDER,
            self::FACTURA_CLIENTE,
            self::POP_CLIENTE,
        ]);
    }

    /**
     * Verifica se é um comprovativo de pagamento
     */
    public function isProofOfPayment(): bool
    {
        return in_array($this, [
            self::POP_COLETA,
            self::POP_ALFANDEGAS,
            self::POP_CORNELDER,
            self::POP_CLIENTE,
        ]);
    }

    /**
     * Retorna categoria do documento
     */
    public function getCategory(): string
    {
        if ($this->isProofOfPayment()) {
            return 'Pagamento';
        }

        if ($this->isFinancial()) {
            return 'Financeiro';
        }

        $categories = [
            self::BL_ORIGINAL->value => 'Transporte',
            self::BL_CARIMBADO->value => 'Transporte',
            self::CARTA_ENDOSSO->value => 'Legal',
            self::DELIVERY_ORDER->value => 'Transporte',
            self::PACKING_LIST->value => 'Carga',
            self::COMMERCIAL_INVOICE->value => 'Carga',
            self::AVISO_TAXACAO->value => 'Alfândega',
            self::AUTORIZACAO_SAIDA->value => 'Alfândega',
            self::STORAGE->value => 'Armazenamento',
            self::IDO->value => 'Alfândega',
            self::SAD->value => 'Alfândega',
            self::CARTA_PORTE->value => 'Transporte',
            self::POD->value => 'Entrega',
            self::ASSINATURA_CLIENTE->value => 'Entrega',
        ];

        return $categories[$this->value] ?? 'Outro';
    }
}
