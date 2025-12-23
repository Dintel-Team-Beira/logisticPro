-- =====================================================
-- SQL para atualizar o banco de dados logisticpro
-- Execute este SQL no phpMyAdmin ou MySQL Workbench
-- =====================================================

-- 1. PRIMEIRO: Tornar shipment_id nullable na tabela invoices
--    (Permite criar faturas sem processo/shipment associado)
-- =====================================================

-- Remover foreign key constraint
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_shipment_id_foreign`;

-- Modificar coluna para nullable
ALTER TABLE `invoices` MODIFY `shipment_id` BIGINT UNSIGNED NULL;

-- Adicionar foreign key de volta (agora permitindo NULL)
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_shipment_id_foreign`
  FOREIGN KEY (`shipment_id`)
  REFERENCES `shipments` (`id`)
  ON DELETE CASCADE;


-- 2. SEGUNDO: Criar tabela financial_transactions
--    (Para registrar entradas e saídas avulsas)
-- =====================================================

CREATE TABLE IF NOT EXISTS `financial_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `transaction_date` DATE NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'entrada ou saída',
  `category` VARCHAR(255) NULL COMMENT 'categoria da transação',
  `description` TEXT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `client_id` BIGINT UNSIGNED NULL,
  `reference` VARCHAR(255) NULL COMMENT 'número de referência',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `financial_transactions_client_id_foreign`
    FOREIGN KEY (`client_id`)
    REFERENCES `clients` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar índices para melhor performance
CREATE INDEX `financial_transactions_transaction_date_index` ON `financial_transactions` (`transaction_date`);
CREATE INDEX `financial_transactions_type_index` ON `financial_transactions` (`type`);
CREATE INDEX `financial_transactions_client_id_index` ON `financial_transactions` (`client_id`);


-- =====================================================
-- CONCLUÍDO!
-- Após executar este SQL:
-- 1. Atualize a página http://127.0.0.1:8000/financial
-- 2. Teste criar transações em /financial-transactions
-- =====================================================
