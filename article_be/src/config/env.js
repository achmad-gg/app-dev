// src/config/env.js
import dotenv from 'dotenv'
dotenv.config()

const required = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'JWT_SECRET'
]

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Environment variable ${key} is missing`)
  }
})

export const env = {
  port: process.env.PORT,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
}
