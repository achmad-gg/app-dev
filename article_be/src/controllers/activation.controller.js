import { pool } from '../config/db.js'

export const requestActivation = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { reason } = req.body

    if (!reason?.trim()) {
      return res.status(400).json({ message: 'Reason is required' })
    }

    const userResult = await pool.query(
      `SELECT status FROM users WHERE id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = userResult.rows[0]

    if (user.status !== 'banned') {
      return res.status(403).json({
        message: 'Only permanently banned users can request activation'
      })
    }

    const existing = await pool.query(
      `SELECT id FROM activation_requests
       WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'You already have a pending activation request'
      })
    }

    await pool.query(
      `INSERT INTO activation_requests (user_id, reason)
       VALUES ($1, $2)`,
      [userId, reason]
    )

    res.json({ message: 'Activation request submitted' })
  } catch (err) {
    next(err)
  }
}

export const approveActivation = async (req, res, next) => {
  const client = await pool.connect()

  try {
    const { requestId } = req.params
    const adminId = req.user.id

    await client.query('BEGIN')

    const result = await client.query(
      `SELECT user_id FROM activation_requests
       WHERE id = $1 AND status = 'pending'`,
      [requestId]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Request not found' })
    }

    const userId = result.rows[0].user_id

    await client.query(
      `UPDATE users
       SET status = 'active',
           violation_count = 0
       WHERE id = $1`,
      [userId]
    )

    await client.query(
      `UPDATE activation_requests
       SET status = 'approved',
           reviewed_by = $1,
           reviewed_at = NOW()
       WHERE id = $2`,
      [adminId, requestId]
    )

    await client.query('COMMIT')

    res.json({ message: 'User reactivated' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}
