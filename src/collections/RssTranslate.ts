import type { CollectionConfig } from 'payload'

export const RssTranslate: CollectionConfig = {
  slug: 'rssTranslate',
  fields: [
    {
      name: 'data',
      type: 'json',
    },
    {
      name: 'rssData',
      type: 'relationship',
      relationTo: 'rssData',
    },
  ],
}
