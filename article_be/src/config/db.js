import { Pool } from 'pg'
import { env } from './env.js'

export const pool = new Pool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.pass,
  database: env.db.name,
})
