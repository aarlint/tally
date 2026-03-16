import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { api } from './routes'

const PORT = parseInt(process.env.PORT || '3000')

const app = new Hono()

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/*', cors())
}

// API routes
app.route('/api', api)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist' }))
  app.get('*', serveStatic({ path: './dist/index.html' }))
}

console.log(`Tally server running on port ${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
