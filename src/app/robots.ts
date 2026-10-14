import type { MetadataRoute } from 'next'
import { config } from '@/shared/config/app.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/auth/',
        '/audits',
        '/clinical-history',
        '/clinical-medication',
        '/dashboard',
        '/emergency-contacts',
        '/entrance-exit',
        '/login',
        '/medical-records',
        '/notifications',
        '/nursing',
        '/older-adult-family',
        '/older-adult-updates',
        '/permissions',
        '/physiotherapy',
        '/profile',
        '/programs',
        '/psychology',
        '/roles',
        '/settings',
        '/social-work',
        '/specialized-appointments',
        '/specialized-areas',
        '/sub-programs',
        '/two-factor',
        '/users',
        '/vaccines',
        '/virtualFiles',
      ],
    },
    sitemap: `${config.site.url}/sitemap.xml`,
  }
}
