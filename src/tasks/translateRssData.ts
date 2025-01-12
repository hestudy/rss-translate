import { translate } from '@/utils/translate'
import { TaskConfig } from 'payload'
import Parser from 'rss-parser'

export const translateRssData: TaskConfig<'translateRssData'> = {
  slug: 'translateRssData',
  handler: async ({ req }) => {
    const rssData = await req.payload.find({
      collection: 'rssData',
      joins: {
        rssTranslate: {
          where: {
            id: {
              exists: false,
            },
          },
        },
      },
    })

    for await (const rssDataItem of rssData.docs) {
      const data = rssDataItem.data as Parser.Item
      const title = await translate(data.title)
      const content = await translate(data.content)
      await req.payload.create({
        collection: 'rssTranslate',
        data: {
          data: {
            ...data,
            title,
            content,
          },
          rssData: rssDataItem.id,
        },
      })
    }

    return {
      output: {},
    }
  },
}
