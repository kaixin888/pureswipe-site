import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export async function POST(request) {
  try {
    const { order_id, email, item, pay_method } = await request.json();

    if (!order_id || !item) {
      return NextResponse.json({ success: false, error: 'Missing order_id or item' }, { status: 400 });
    }

    // 1. Get existing order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Build updated items array
    const existingItems = order.items || [];
    const updatedItems = [...existingItems, item];

    // 3. Update total amount
    const addedAmount = (item.price || 0) * (item.quantity || 1);
    const currentAmount = parseFloat(order.amount) || 0;
    const newAmount = (currentAmount + addedAmount).toFixed(2);

    // 4. Update product_name string
    const existingNames = order.product_name || '';
    const newProductName = existingNames
      ? `${existingNames}, ${item.name}`
      : item.name;

    // 5. Update in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        items: updatedItems,
        amount: newAmount,
        product_name: newProductName,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 6. Decrement inventory for upsell item
    if (item.id) {
      await supabase.rpc('decrement_product_stock', {
        p_id: item.id,
        p_quantity: item.quantity || 1,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      newAmount,
      addedItem: item,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
