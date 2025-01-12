import type { CollectionConfig } from 'payload'

export const Rss: CollectionConfig = {
  slug: 'rss',
  fields: [
    {
      name: 'link',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        disableListColumn: true,
      },
    },
  ],
}
