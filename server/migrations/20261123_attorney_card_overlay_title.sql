-- Run once in Hostinger phpMyAdmin before deploying this feature.
-- It preserves every existing Professional Title / Rank unchanged.
ALTER TABLE attorneys ADD COLUMN card_overlay_title TEXT NULL AFTER professional_title;
