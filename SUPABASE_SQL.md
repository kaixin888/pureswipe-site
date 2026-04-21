# Supabase Hardening SQL (v2 - Clean)

Run this in the [Supabase SQL Editor](https://supabase.com/dashboard/project/olgfqcygqzuevaftmdja/sql/new) to enable hardened inventory and discount logic. 

**IMPORTANT: This script will remove any old/conflicting versions of the functions.**

## 1. Inventory Stock Management
Safely decrements stock without allowing it to go below zero.
```sql
-- 1. Remove ANY existing versions of this function to prevent ambiguity
DROP FUNCTION IF EXISTS decrement_product_stock(bigint, int);
DROP FUNCTION IF EXISTS decrement_product_stock(uuid, int);
DROP FUNCTION IF EXISTS decrement_product_stock(uuid, integer);

-- 2. Create the clean UUID-based version
CREATE OR REPLACE FUNCTION decrement_product_stock(p_id uuid, p_qty integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_id;
END;
$$;
```

## 2. Discount Code Usage Tracking
Increments the usage count for a given discount code.
```sql
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code text)
RETURNS void LANGUAGE sql AS $$
  UPDATE discount_codes
  SET usage_count = usage_count + 1
  WHERE code = p_code;
$$;
```

## 3. Verify Table Columns
Ensure the `products` table has the `stock` column.
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 999;
```
