-- Schema only, no production data. Used exclusively in disposable test databases.
CREATE TABLE `activity_logs` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` LONGTEXT NULL,
  `user_name` LONGTEXT NULL,
  `user_role` LONGTEXT NULL,
  `action` LONGTEXT NOT NULL,
  `module` LONGTEXT NOT NULL,
  `record_id` LONGTEXT NULL,
  `details` LONGTEXT NULL,
  `timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `activity_logs_pkey` PRIMARY KEY (`id`),
  KEY `idx_activity_timestamp` (`timestamp` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `articles` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` LONGTEXT NOT NULL,
  `excerpt` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `reading_time` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `published_at` DATETIME(6) NULL,
  `author` JSON NULL,
  `status` LONGTEXT NOT NULL DEFAULT ('published'),
  `featured_image` LONGTEXT NULL,
  `practice_area_id` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `articles_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `articles_slug_key` UNIQUE (`slug`),
  KEY `idx_articles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `attorneys` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `full_name` LONGTEXT NOT NULL,
  `professional_title` LONGTEXT NOT NULL,
  `portrait_url` LONGTEXT NULL,
  `primary_specialization` LONGTEXT NULL,
  `biography` LONGTEXT NULL,
  `email` LONGTEXT NULL,
  `direct_phone` LONGTEXT NULL,
  `linkedin_url` LONGTEXT NULL,
  `is_partner` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `order_index` INT NOT NULL DEFAULT 0,
  `practice_area_ids` JSON NOT NULL DEFAULT ('[]'),
  `education` JSON NOT NULL DEFAULT ('[]'),
  `bar_admissions` JSON NOT NULL DEFAULT ('[]'),
  `professional_experience` JSON NOT NULL DEFAULT ('[]'),
  `memberships` JSON NOT NULL DEFAULT ('[]'),
  `awards` JSON NOT NULL DEFAULT ('[]'),
  `selected_publications` JSON NOT NULL DEFAULT ('[]'),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `home_card_image_url` LONGTEXT NULL,
  `home_modal_image_url` LONGTEXT NULL,
  `partner_page_image_url` LONGTEXT NULL,
  CONSTRAINT `attorneys_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `attorneys_slug_key` UNIQUE (`slug`),
  KEY `idx_attorneys_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `consultation_requests` (
  `id` VARCHAR(191) NOT NULL,
  `reference_number` VARCHAR(191) NOT NULL,
  `full_name` LONGTEXT NOT NULL,
  `email_address` LONGTEXT NOT NULL,
  `contact_number` LONGTEXT NOT NULL,
  `company_name` LONGTEXT NULL,
  `preferred_consultation_type` LONGTEXT NOT NULL DEFAULT ('online'),
  `practice_area_id` LONGTEXT NULL,
  `preferred_date` LONGTEXT NULL,
  `preferred_time` LONGTEXT NULL,
  `brief_concern` LONGTEXT NOT NULL,
  `privacy_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `internal_notes` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `consultation_requests_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `consultation_requests_reference_number_key` UNIQUE (`reference_number`),
  KEY `idx_consultation_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `contact_messages` (
  `id` VARCHAR(191) NOT NULL,
  `full_name` LONGTEXT NOT NULL,
  `email` LONGTEXT NOT NULL,
  `phone` LONGTEXT NULL,
  `subject` LONGTEXT NULL,
  `message` LONGTEXT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'unread',
  `notes` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `contact_messages_pkey` PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `faq_categories` (
  `id` VARCHAR(191) NOT NULL,
  `name` LONGTEXT NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `faq_categories_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `faq_categories_slug_key` UNIQUE (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `faqs` (
  `id` VARCHAR(191) NOT NULL,
  `category_id` VARCHAR(191) NULL,
  `question` LONGTEXT NOT NULL,
  `answer` LONGTEXT NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `faqs_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `media` (
  `id` VARCHAR(191) NOT NULL,
  `name` LONGTEXT NOT NULL,
  `filename` LONGTEXT NULL,
  `original_name` LONGTEXT NULL,
  `storage_path` LONGTEXT NULL,
  `url` LONGTEXT NOT NULL,
  `file_type` LONGTEXT NOT NULL DEFAULT ('image'),
  `format` LONGTEXT NULL,
  `size_bytes` BIGINT NULL,
  `size` LONGTEXT NULL,
  `category` VARCHAR(191) NOT NULL DEFAULT 'general',
  `alt_text` LONGTEXT NULL,
  `uploaded_by` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `media_pkey` PRIMARY KEY (`id`),
  KEY `idx_media_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `navigation` (
  `id` VARCHAR(191) NOT NULL,
  `label` LONGTEXT NOT NULL,
  `path` LONGTEXT NOT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `order_index` INT NOT NULL DEFAULT 0,
  `children` JSON NOT NULL DEFAULT ('[]'),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `navigation_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `news` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` LONGTEXT NOT NULL,
  `excerpt` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `date` LONGTEXT NULL,
  `category` LONGTEXT NULL,
  `status` LONGTEXT NOT NULL DEFAULT ('published'),
  `featured_image` LONGTEXT NULL,
  `practice_area_id` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `news_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `news_slug_key` UNIQUE (`slug`),
  KEY `idx_news_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `page_versions` (
  `id` VARCHAR(191) NOT NULL,
  `page_id` VARCHAR(191) NOT NULL,
  `version` INT NOT NULL,
  `snapshot` JSON NOT NULL,
  `note` LONGTEXT NULL,
  `created_by` LONGTEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `page_versions_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `pages` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` LONGTEXT NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `meta_title` LONGTEXT NULL,
  `meta_description` LONGTEXT NULL,
  `sections` JSON NOT NULL DEFAULT ('[]'),
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `pages_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `pages_slug_key` UNIQUE (`slug`),
  KEY `idx_pages_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `practice_areas` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` LONGTEXT NOT NULL,
  `icon_name` LONGTEXT NULL,
  `short_description` LONGTEXT NULL,
  `full_description` LONGTEXT NULL,
  `key_capabilities` JSON NOT NULL DEFAULT ('[]'),
  `key_stat` LONGTEXT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `practice_areas_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `practice_areas_slug_key` UNIQUE (`slug`),
  KEY `idx_practice_areas_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `site_settings` (
  `id` VARCHAR(191) NOT NULL,
  `settings` JSON NOT NULL,
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT `site_settings_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
