-- 1. 清理旧版函数（防止 UUID 冲突）
DROP FUNCTION IF EXISTS decrement_product_stock(uuid, int);
DROP FUNCTION IF EXISTS decrement_product_stock(bigint, int);
DROP FUNCTION IF EXISTS decrement_product_stock(uuid, integer);
DROP FUNCTION IF EXISTS increment_discount_usage(text);

-- 2. 创建正确的库存扣减函数 (使用 UUID)
-- 注意参数名必须与后端代码对齐: p_id, p_quantity
CREATE OR REPLACE FUNCTION decrement_product_stock(p_id uuid, p_quantity int)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建折扣码使用统计函数
-- 注意：确保更新的列名是 usage_count (与当前表结构一致)
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code text)
RETURNS void AS $$
BEGIN
  UPDATE discount_codes 
  SET usage_count = usage_count + 1 
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
