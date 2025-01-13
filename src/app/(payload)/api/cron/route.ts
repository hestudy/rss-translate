import { logger } from '@/utils/logger'
import cron from 'node-cron'

export async function POST() {
  try {
    cron.schedule(process.env.FEED_CRON || '0 * * * *', async () => {
      logger.info('Running cron job')
      fetch('http://localhost:3000/api/rss/refresh')
        .then(() => {
          logger.info('Cron job completed')
        })
        .catch((e) => {
          logger.error(e)
        })
    })

    return Response.json({ data: 'Success', status: 200 })
  } catch (error) {
    logger.error(error)
    return Response.json({ error: error }, { status: 500 })
  }
}
