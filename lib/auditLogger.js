// 审计日志辅助函数
// 用法: await auditLog({ user_id, action: 'update_product', target_type: 'products', target_id, old_values, new_values });

export async function auditLog({ user_id, action, target_type, target_id, old_values, new_values }) {
  try {
    await fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, action, target_type, target_id, old_values, new_values }),
    });
  } catch (e) {
    console.error('auditLog error:', e);
  }
}
