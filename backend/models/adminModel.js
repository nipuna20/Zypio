const db = require('../db');

async function createAdmin({ username, password }) {
  const result = await db.query(
    'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, password]
  );
  return result.rows[0];
}

async function findAdminByUsername(username) {
  const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
  return result.rows[0] || null;
}

async function findAdminById(id) {
  const result = await db.query('SELECT * FROM admins WHERE id = $1', [id]);
  return result.rows[0] || null;
}

module.exports = {
  createAdmin,
  findAdminByUsername,
  findAdminById,
};