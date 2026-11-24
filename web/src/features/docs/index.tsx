/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from '@/components/ui/native-select'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'

import { DocsArticle } from './article'
import { getDocsNavigation, topics } from './topics'

import '@/styles/delivery-public.css'

const route = getRouteApi('/docs/')

export function DeveloperDocs() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const navigate = route.useNavigate()
  const topic = route.useSearch().topic ?? 'quick-start'
  const groups = getDocsNavigation(t)
  const group =
    groups.find((entry) => entry.items.some((item) => item.id === topic)) ??
    groups[0]
  const current =
    group.items.find((item) => item.id === topic) ?? group.items[0]
  // A configured documentation site is still available as a supplemental resource.
  const resource = new URL('https://docs.newapi.pro')
  const configuredLink = status?.docs_link
  const extraUrl =
    typeof configuredLink === 'string' &&
    configuredLink &&
    URL.canParse(configuredLink, window.location.origin)
      ? new URL(configuredLink, window.location.origin)
      : resource

  return (
    <PublicLayout showMainContainer={false} className='delivery-public'>
      <main className='mx-auto grid max-w-6xl gap-7 px-5 pt-24 pb-16 sm:px-8 md:grid-cols-[13.5rem_minmax(0,1fr)] md:gap-12 md:pt-28 lg:gap-16'>
        <aside className='min-w-0'>
          <nav
            aria-label={t('Documentation topics')}
            className='md:sticky md:top-24'
          >
            <div className='mb-4 flex items-center gap-2.5 text-base font-semibold'>
              <span className='bg-accent text-accent-foreground grid size-8 place-items-center rounded-lg'>
                <BookOpen className='size-4' aria-hidden='true' />
              </span>
              {t('Developer docs')}
            </div>
            <NativeSelect
              aria-label={t('Choose a topic')}
              className='w-full md:hidden'
              value={topic}
              onChange={(event) => {
                const selected = topics.find((id) => id === event.target.value)
                if (selected) void navigate({ search: { topic: selected } })
              }}
            >
              {groups.map((section) => (
                <NativeSelectOptGroup key={section.title} label={section.title}>
                  {section.items.map((item) => (
                    <NativeSelectOption key={item.id} value={item.id}>
                      {item.title}
                    </NativeSelectOption>
                  ))}
                </NativeSelectOptGroup>
              ))}
            </NativeSelect>
            <div className='hidden space-y-6 md:block'>
              {groups.map((section) => (
                <div key={section.title}>
                  <p className='text-muted-foreground mb-1.5 px-3 text-[0.72rem] font-semibold tracking-wider uppercase'>
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      to='/docs'
                      search={{ topic: item.id }}
                      aria-current={topic === item.id ? 'page' : undefined}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        topic === item.id
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        </aside>
        <article key={topic} aria-labelledby='doc-heading' className='min-w-0'>
          <header className='border-border border-b pb-6'>
            <p className='mb-2 text-sm font-medium text-(--delivery-highlight)'>
              {group.title}
            </p>
            <h1
              id='doc-heading'
              className='text-4xl font-semibold tracking-tight sm:text-5xl'
            >
              {current.title}
            </h1>
          </header>
          <DocsArticle topic={topic} origin={window.location.origin} />
          {['http:', 'https:'].includes(extraUrl.protocol) &&
            !(
              extraUrl.origin === window.location.origin &&
              extraUrl.pathname.replace(/\/$/, '') === '/docs'
            ) && (
              <div className='border-border mt-10 border-t pt-4'>
                <a
                  className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline'
                  href={extraUrl.href}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {extraUrl.hostname === resource.hostname
                    ? t('New API documentation')
                    : t('Additional documentation')}
                  <ArrowUpRight className='size-3.5' aria-hidden='true' />
                </a>
              </div>
            )}
        </article>
      </main>
      <Footer />
    </PublicLayout>
  )
}
