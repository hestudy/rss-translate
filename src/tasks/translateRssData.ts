import { TaskConfig } from 'payload'

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
      console.log(rssDataItem.id)
    }

    return {
      output: {},
    }
  },
}
