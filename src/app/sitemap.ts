import type { MetadataRoute } from 'next'
import { publicRoutes } from '@/modules/marketing/presentation/content/marketingContent'
import { config } from '@/shared/config/app.config'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${config.site.url}${path}`,
    changeFrequency,
    priority,
  }))
}
