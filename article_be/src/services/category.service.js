// src/services/category.service.js
import { pool } from '../config/db.js'

export const getCategories = async () => {
  const { rows } = await pool.query(
    'SELECT id, name FROM categories ORDER BY name ASC'
  )
  return rows
}

export const createCategory = async (name) => {
  const { rows } = await pool.query(
    `INSERT INTO categories (name)
     VALUES ($1)
     RETURNING id, name`,
    [name]
  )
  return rows[0]
}

export const updateCategory = async (id, name) => {
  const { rows } = await pool.query(
    `UPDATE categories
     SET name = $1
     WHERE id = $2
     RETURNING id, name`,
    [name, id]
  )
  return rows[0]
}

export const deleteCategory = async (id) => {
  await pool.query('DELETE FROM categories WHERE id = $1', [id])
}
