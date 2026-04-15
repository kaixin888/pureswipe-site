-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/olgfqcygqzuevaftmdja/sql/new

-- 1. Add new columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS asin text UNIQUE,
  ADD COLUMN IF NOT EXISTS extra_images text,
  ADD COLUMN IF NOT EXISTS bullets text,
  ADD COLUMN IF NOT EXISTS rating numeric(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS popular boolean DEFAULT false;

-- 2. Create increment_discount_usage function (for discount code tracking)
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code text)
RETURNS void LANGUAGE sql AS $$
  UPDATE discount_codes
  SET usage_count = usage_count + 1
  WHERE code = p_code;
$$;
