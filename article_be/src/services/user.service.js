import { pool } from '../config/db.js'

export const blockUserService = async (targetUserId, adminId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const userResult = await client.query(
      `SELECT id, role_id, status, violation_count
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [targetUserId]
    )

    if (userResult.rows.length === 0) {
      throw new Error('User not found')
    }

    const user = userResult.rows[0]

    if (user.role_id !== 2) {
      throw new Error('Only normal users can be blocked')
    }

    if (user.status === 'banned') {
      throw new Error('User already permanently banned')
    }

    const newCount = (user.violation_count || 0) + 1

    let updateQuery
    let values

    if (newCount >= 3) {
      // Permanent
      updateQuery = `
        UPDATE users
        SET status = 'banned',
            violation_count = $2,
            blocked_at = NOW(),
            blocked_by = $3,
            ban_expires_at = NULL
        WHERE id = $1
        RETURNING id, status, violation_count
      `
      values = [targetUserId, newCount, adminId]
    } else {
      // Temporary 7 days
      updateQuery = `
        UPDATE users
        SET status = 'suspended',
            violation_count = $2,
            blocked_at = NOW(),
            blocked_by = $3,
            ban_expires_at = NOW() + INTERVAL '7 days'
        WHERE id = $1
        RETURNING id, status, violation_count, ban_expires_at
      `
      values = [targetUserId, newCount, adminId]
    }

    const result = await client.query(updateQuery, values)

    await client.query('COMMIT')
    return result.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const activateUserService = async (userId) => {
  const result = await pool.query(
    `
    UPDATE users
SET status = 'active',
    violation_count = 0,
    ban_expires_at = NULL
WHERE id = $1
    RETURNING id, status, violation_count
    `,
    [userId]
  )

  return result.rows[0]
}
