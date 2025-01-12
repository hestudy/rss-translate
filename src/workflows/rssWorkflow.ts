import { WorkflowConfig } from 'payload'

export const rssWorkflow: WorkflowConfig<'rssWorkflow'> = {
  slug: 'rssWorkflow',
  inputSchema: [
    {
      name: 'id',
      type: 'number',
    },
    {
      name: 'link',
      type: 'text',
    },
  ],
  handler: async ({ req, tasks }) => {
    const rss = await req.payload.find({
      collection: 'rss',
    })

    for await (const item of rss.docs) {
      await tasks.requestRssData('1', {
        input: item,
      })
    }

    await tasks.saveRssData('2', {
      input: {},
    })

    await tasks.translateRssData('3', {
      input: {},
    })
  },
}
