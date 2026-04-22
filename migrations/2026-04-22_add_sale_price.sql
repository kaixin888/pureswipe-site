-- Phase E-2: Add sale_price column for promotional pricing
-- Run this in Supabase Dashboard > SQL Editor
-- Project: olgfqcygqzuevaftmdja

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price numeric NULL;

COMMENT ON COLUMN products.sale_price IS
  'Promotional price (USD). NULL = no sale. Must be < price (enforced in app layer).';

-- Optional: enforce at DB level (uncomment to harden)
-- ALTER TABLE products
--   ADD CONSTRAINT products_sale_price_check
--   CHECK (sale_price IS NULL OR sale_price < price);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'sale_price';
