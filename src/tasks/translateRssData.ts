import { rss_data, rss_translate } from '@/payload-generated-schema'
import { logger } from '@/utils/logger'
import { translate } from '@/utils/translate'
import { eq, isNull } from '@payloadcms/db-postgres/drizzle'
import { TaskConfig } from 'payload'
import Parser from 'rss-parser'

export const translateRssData: TaskConfig<'translateRssData'> = {
  slug: 'translateRssData',
  handler: async ({ req }) => {
    logger.info('translateRssData task started')
    const rssData = await req.payload.db.drizzle
      .select()
      .from(rss_data)
      .leftJoin(rss_translate, eq(rss_data.id, rss_translate.rssData))
      .where(isNull(rss_translate))

    logger.info(`Found ${rssData.length} items to translate`)

    for await (const rssDataItem of rssData) {
      logger.info(`Translating ${rssDataItem.rss_data.id}`)
      const data = rssDataItem.rss_data.data as Parser.Item
      const title = await translate(data.title)
      const content = await translate(data.content)
      logger.info(`Translated ${rssDataItem.rss_data.id}`)
      await req.payload.create({
        collection: 'rssTranslate',
        data: {
          data: {
            ...data,
            title,
            content,
          },
          rssData: rssDataItem.rss_data.id,
        },
      })
      logger.info(`Created translation for ${rssDataItem.rss_data.id}`)
    }
    logger.info('translateRssData task finished')
    return {
      output: {},
    }
  },
}
