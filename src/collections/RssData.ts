import type { CollectionConfig } from 'payload'

export const RssData: CollectionConfig = {
  slug: 'rssData',
  fields: [
    {
      name: 'rss',
      type: 'relationship',
      relationTo: 'rss',
    },
    {
      name: 'rssTranslate',
      type: 'join',
      collection: 'rssTranslate',
      on: 'rssData',
    },
    {
      name: 'data',
      type: 'json',
    },
  ],
}
