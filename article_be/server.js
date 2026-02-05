import { env } from './src/config/env.js'
import app from './src/app.js'

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`)
})
