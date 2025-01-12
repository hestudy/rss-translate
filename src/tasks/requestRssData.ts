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
    const feed = await parser.parseURL(input.link)
    await req.payload.update({
      collection: 'rss',
      data: {
        data: feed,
      },
      id: input.id,
    })
    return {
      output: {},
    }
  },
}
