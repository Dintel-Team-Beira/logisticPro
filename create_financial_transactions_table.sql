-- SQL para criar a tabela financial_transactions
-- Execute este SQL diretamente no seu banco de dados MySQL

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
