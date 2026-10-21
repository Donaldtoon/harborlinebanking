require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
(async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || ' Administrator').trim().split(/\s+/);
  if (!email || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in environment before running npm run seed-admin.');
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES($1,$2,'admin',$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id,email`, [email, hash, name[0] || '', name.slice(1).join(' ') || 'Administrator']);
    if (!result.rowCount) console.log('An account with that email already exists; no changes made.');
    else { await pool.query('INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES($1,$2,$1,$3)', [result.rows[0].id, 'admin.seeded', JSON.stringify({ email })]); console.log(`Administrator created: ${email}`); }
  } finally { await pool.end(); }
})().catch(err => { console.error(err.message); process.exit(1); });
