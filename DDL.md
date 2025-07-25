
-- -----------------------------------------------------
-- Table `users`
-- Stores user account information, including credentials and balance.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` TEXT NOT NULL UNIQUE,
  `first_name` TEXT NOT NULL,
  `last_name` TEXT NOT NULL,
  `hashed_password` TEXT NOT NULL,
  `profile_image` TEXT,
  `balance` INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------
-- Table `banners`
-- Stores promotional banner information.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `banner_name` TEXT NOT NULL,
  `banner_image` TEXT NOT NULL,
  `description` TEXT NOT NULL
);

-- -----------------------------------------------------
-- Table `services`
-- Stores information about available payment services.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `service_code` TEXT NOT NULL UNIQUE,
  `service_name` TEXT NOT NULL,
  `service_icon` TEXT NOT NULL,
  `service_tariff` INTEGER NOT NULL
);

-- -----------------------------------------------------
-- Table `transactions`
-- Logs all financial transactions (TOPUP and PAYMENT).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `invoice_number` TEXT NOT NULL UNIQUE,
  `transaction_type` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `total_amount` INTEGER NOT NULL,
  `created_on` TEXT NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);
