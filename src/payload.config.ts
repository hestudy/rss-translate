// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Rss } from './collections/Rss'
import { RssData } from './collections/RssData'
import { RssTranslate } from './collections/RssTranslate'
import { Users } from './collections/Users'
import { requestRssData } from './tasks/requestRssData'
import { rssWorkflow } from './workflows/rssWorkflow'
import { saveRssData } from './tasks/saveRssData'
import { translateRssData } from './tasks/translateRssData'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Rss, RssData, RssTranslate],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  jobs: {
    tasks: [requestRssData, saveRssData, translateRssData],
    workflows: [rssWorkflow],
  },
})
