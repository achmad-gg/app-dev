import { pool } from '../config/db.js'

export const writeGuard = async (req, res, next) => {
  const result = await pool.query(
    `SELECT status, ban_expires_at
     FROM users
     WHERE id = $1`,
    [req.user.id]
  )

  if (result.rows.length === 0) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const user = result.rows[0]

  if (user.status === 'banned') {
    return res.status(403).json({
      message: 'Account permanently banned'
    })
  }

  if (user.status === 'suspended') {
    if (user.ban_expires_at && new Date(user.ban_expires_at) > new Date()) {
      return res.status(403).json({
        message: 'Account temporarily suspended'
      })
    }

    // Suspension expired → restore
    await pool.query(
      `UPDATE users
       SET status = 'active',
           ban_expires_at = NULL
       WHERE id = $1`,
      [req.user.id]
    )
  }

  next()
}
