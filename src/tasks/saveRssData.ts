import { logger } from '@/utils/logger'
import { TaskConfig } from 'payload'
import Parser from 'rss-parser'

export const saveRssData: TaskConfig<'saveRssData'> = {
  slug: 'saveRssData',
  handler: async ({ req }) => {
    logger.info('saveRssData task started')
    const rss = await req.payload.find({
      collection: 'rss',
    })

    for await (const rssItem of rss.docs) {
      if (rssItem.data) {
        const data = rssItem.data as {
          [key: string]: any
        } & Parser.Output<{
          [key: string]: any
        }>
        const items = data.items

        for await (const rssDataItem of items) {
          const countRes = await req.payload.count({
            collection: 'rssData',
            where: {
              'data.link': {
                equals: rssDataItem.link,
              },
            },
          })

          if (countRes.totalDocs === 0) {
            logger.info(`Creating new rssData item: ${rssDataItem.link}`)
            await req.payload.create({
              collection: 'rssData',
              data: {
                data: rssDataItem,
                rss: rssItem.id,
              },
            })
            logger.info(`Created new rssData item: ${rssDataItem.link}`)
          }
        }
      }
    }
    logger.info('saveRssData task finished')
    return {
      output: {},
    }
  },
}
