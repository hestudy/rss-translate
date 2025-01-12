import { payload } from '@/utils/payload'

export async function GET() {
  const rss = await payload.find({
    collection: 'rss',
  })

  for await (const item of rss.docs) {
    const countRes = await payload.count({
      collection: 'payload-jobs',
      where: {
        queue: {
          equals: 'rss',
        },
        'input.id': {
          equals: item.id,
        },
      },
    })

    if (countRes.totalDocs === 0) {
      await payload.jobs.queue({
        input: item,
        queue: 'rss',
        workflow: 'rssWorkflow',
      })
    }
  }

  payload.jobs.run({
    queue: 'rss',
  })

  return Response.json({
    success: true,
  })
}
