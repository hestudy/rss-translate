import { logger } from '@/utils/logger'
import { TaskConfig } from 'payload'
import Parser from 'rss-parser'

const parser = new Parser()

export const requestRssData: TaskConfig<'requestRssData'> = {
  slug: 'requestRssData',
  inputSchema: [
    {
      name: 'id',
      type: 'number',
      required: true,
    },
    {
      name: 'link',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    logger.info('requestRssData task started')
    const feed = await parser.parseURL(input.link)
    logger.info(`Feed title: ${feed.title}`)
    await req.payload.update({
      collection: 'rss',
      data: {
        data: feed,
      },
      id: input.id,
    })
    logger.info('requestRssData task finished')
    return {
      output: {},
    }
  },
}
