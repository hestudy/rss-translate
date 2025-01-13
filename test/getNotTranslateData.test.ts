import { rss_data, rss_translate } from '@/payload-generated-schema'
import { payload } from '@/utils/payload'
import { eq, isNull } from '@payloadcms/db-postgres/drizzle'

const res = await payload.db.drizzle
  .select()
  .from(rss_data)
  .leftJoin(rss_translate, eq(rss_data.id, rss_translate.rssData))
  .where(isNull(rss_translate))

console.log(res)
