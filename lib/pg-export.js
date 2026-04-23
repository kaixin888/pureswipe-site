import pg from 'pg';

/**
 * Export Supabase schemas as SQL using the pg library.
 * This replaces pg_dump binary dependency — works in Vercel serverless.
 *
 * Exports: CREATE TABLE, indexes, RLS policies, triggers, and data (INSERT statements).
 */

/**
 * Quote a PostgreSQL identifier.
 */
function qident(name) {
  return '"' + name.replace(/"/g, '""') + '"';
}

/**
 * Escape a value for SQL INSERT.
 */
function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return "'" + val.toISOString() + "'";
  // Buffer → hex
  if (Buffer.isBuffer(val)) return "'\\x" + val.toString('hex') + "'";
  // String — escape single quotes
  return "'" + String(val).replace(/'/g, "''") + "'";
}

/**
 * Export a single table's DDL + data.
 */
async function exportTable(client, schema, tableName) {
  const fqtn = qident(schema) + '.' + qident(tableName);
  let sql = '';

  // --- Column info ---
  const { rows: columns } = await client.query(
    `SELECT column_name, data_type, column_default, is_nullable, character_maximum_length, udt_name
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schema, tableName]
  );

  if (columns.length === 0) return ''; // view or no columns

  // --- CREATE TABLE ---
  sql += `-- Table: ${fqtn}\n`;
  sql += `DROP TABLE IF EXISTS ${fqtn} CASCADE;\n`;
  sql += `CREATE TABLE ${fqtn} (\n`;

  const colDefs = columns.map(col => {
    let type = col.data_type;
    if (type === 'character varying') type = `varchar(${col.character_maximum_length || ''})`;
    else if (type === 'USER-DEFINED') type = col.udt_name;

    let def = `  ${qident(col.column_name)} ${type}`;
    if (col.column_default) def += ` DEFAULT ${col.column_default}`;
    if (col.is_nullable === 'NO') def += ' NOT NULL';
    return def;
  });
  sql += colDefs.join(',\n');
  sql += '\n);\n\n';

  // --- Primary key ---
  try {
    const { rows: pks } = await client.query(
      `SELECT a.attname
       FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       WHERE i.indrelid = $1::regclass AND i.indisprimary
       ORDER BY array_position(i.indkey, a.attnum)`,
      [fqtn]
    );
    if (pks.length > 0) {
      sql += `ALTER TABLE ${fqtn} ADD PRIMARY KEY (${pks.map(r => qident(r.attname)).join(', ')});\n\n`;
    }
  } catch { /* no PK */ }

  // --- Data rows (INSERT) ---
  const { rows: data } = await client.query(`SELECT * FROM ${fqtn}`);
  if (data.length > 0) {
    const colNames = columns.map(c => qident(c.column_name));
    sql += `-- Data: ${data.length} rows\n`;
    for (const row of data) {
      const vals = columns.map(c => escapeValue(row[c.column_name]));
      sql += `INSERT INTO ${fqtn} (${colNames.join(', ')}) VALUES (${vals.join(', ')});\n`;
    }
    sql += '\n';
  }

  // --- Indexes ---
  try {
    const { rows: indexes } = await client.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2`,
      [schema, tableName]
    );
    for (const idx of indexes) {
      // Skip auto-created indexes for primary keys (already handled)
      if (idx.indexdef.includes('CREATE UNIQUE INDEX') && idx.indexname.includes('_pkey')) continue;
      sql += idx.indexdef + ';\n';
    }
  } catch { /* no indexes */ }

  // --- RLS policies ---
  try {
    const { rows: policies } = await client.query(
      `SELECT policyname, permissive, roles, cmd, qual, with_check
       FROM pg_policies WHERE schemaname = $1 AND tablename = $2`,
      [schema, tableName]
    );
    if (policies.length > 0) {
      sql += `\n-- RLS Policies for ${fqtn}\n`;
      sql += `ALTER TABLE ${fqtn} ENABLE ROW LEVEL SECURITY;\n`;
      for (const p of policies) {
        sql += `CREATE POLICY "${p.policyname}" ON ${fqtn}
  AS ${p.permissive}
  FOR ${p.cmd}
  TO ${p.roles}
  USING (${p.qual || 'TRUE'})
  WITH CHECK (${p.with_check || 'TRUE'});\n`;
      }
    }
  } catch { /* RLS not available or no policies */ }

  // --- Triggers ---
  try {
    const { rows: triggers } = await client.query(
      `SELECT trigger_name, event_manipulation, action_statement, action_timing
       FROM information_schema.triggers
       WHERE event_object_schema = $1 AND event_object_table = $2`,
      [schema, tableName]
    );
    for (const t of triggers) {
      sql += `CREATE TRIGGER "${t.trigger_name}"
  ${t.action_timing} ${t.event_manipulation} ON ${fqtn}
  FOR EACH ROW ${t.action_statement};\n`;
    }
  } catch { /* no triggers */ }

  return sql;
}

/**
 * Main export: connect to Supabase, export specified schemas as SQL.
 *
 * @param {object} opts
 * @param {string} opts.url      - postgresql://postgres.[ref]:[pwd]@db.[ref].supabase.co:5432/postgres
 * @param {string[]} opts.schemas - e.g. ['public', 'auth']
 * @returns {Promise<string>} Full SQL dump
 */
export async function exportSupabase({ url, schemas = ['public', 'auth'] }) {
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    let sql = '-- Clowand Supabase Backup\n';
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Schemas: ${schemas.join(', ')}\n\n`;
    sql += 'BEGIN;\n\n';

    for (const schema of schemas) {
      sql += `-- ============================================================\n`;
      sql += `-- Schema: ${schema}\n`;
      sql += `-- ============================================================\n\n`;

      sql += `CREATE SCHEMA IF NOT EXISTS ${qident(schema)};\n\n`;

      // Get all tables in this schema
      const { rows: tables } = await client.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename`,
        [schema]
      );

      for (const { tablename } of tables) {
        const tableSql = await exportTable(client, schema, tablename);
        sql += tableSql;
      }

      // Get views
      try {
        const { rows: views } = await client.query(
          `SELECT viewname, definition FROM pg_views WHERE schemaname = $1`,
          [schema]
        );
        for (const v of views) {
          sql += `-- View: ${qident(schema)}.${qident(v.viewname)}\n`;
          sql += `CREATE OR REPLACE VIEW ${qident(schema)}.${qident(v.viewname)} AS\n${v.definition};\n\n`;
        }
      } catch { /* no views */ }
    }

    sql += 'COMMIT;\n';
    return sql;
  } finally {
    await client.end();
  }
}
