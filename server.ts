import { logger } from '@/utils/logger'
import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)

  fetch('http://localhost:3000/api/cron', {
    method: 'post',
  })
    .then(() => {
      logger.info('cron job done')
    })
    .catch((e) => {
      logger.error(e)
    })

  logger.info(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`,
  )
})
