// activationRequest.service.js
import { pool } from "../config/db.js";

export const getAllActivationRequestsService = async () => {
  const result = await pool.query(`
    SELECT 
      ar.id,
      ar.user_id,
      ar.reason,
      ar.status,
      ar.created_at,
      u.email,
      u.fullname,
      u.status AS user_status
    FROM activation_requests ar
    JOIN users u ON u.id = ar.user_id
    ORDER BY ar.created_at DESC
  `);

  return result.rows;
};

export const approveActivationRequestService = async (requestId) => {
  // 1. Update the request status
  const reqResult = await pool.query(
    `UPDATE activation_requests
     SET status = 'approved', reviewed_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, status`,
    [requestId],
  );

  const request = reqResult.rows[0];
  if (!request) throw new Error("Activation request not found");

  // 2. Also activate the user
  const userResult = await pool.query(
    `UPDATE users
     SET status = 'active',
         violation_count = 0,
         ban_expires_at = NULL
     WHERE id = $1
     RETURNING id, status, violation_count`,
    [request.user_id],
  );

  return {
    request: reqResult.rows[0],
    user: userResult.rows[0],
  };
};

export const rejectActivationRequestService = async (requestId) => {
  const result = await pool.query(
    `UPDATE activation_requests
     SET status = 'rejected', reviewed_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, status`,
    [requestId],
  );

  const request = result.rows[0];
  if (!request) throw new Error("Activation request not found");

  // User status stays as-is (suspended/banned) — rejection means no change
  return { request };
};
