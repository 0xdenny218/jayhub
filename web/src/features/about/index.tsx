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
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Layers, LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { isHttpUrl, isLikelyHtml } from '@/lib/content-format'
import { requireServerSuccess } from '@/lib/server-error-message'

import { getAboutContent } from './api'

import '@/styles/delivery-public.css'

function DefaultAbout() {
  const { t } = useTranslation()
  const { systemName, logo } = useSystemConfig()
  const links = useTopNavLinks()
  const resources = [
    {
      to: '/pricing',
      title: t('Model Square'),
      description: t(
        'Compare model capabilities, supported endpoints, and pricing.'
      ),
      icon: Layers,
    },
    {
      to: '/docs',
      title: t('Developer docs'),
      description: t(
        'Create an API key and send your first request with a working example.'
      ),
      icon: BookOpen,
    },
    {
      to: '/dashboard',
      title: t('Console'),
      description: t(
        'Manage your keys, check your balance, and review request history.'
      ),
      icon: LayoutDashboard,
    },
  ] as const
  const visibleResources = resources.filter((resource) =>
    links.some((link) => link.href === resource.to)
  )
  const currentYear = new Date().getFullYear()

  return (
    <main className='mx-auto max-w-5xl px-5 pt-24 pb-16 sm:px-8 sm:pt-32'>
      <section className='border-border border-b pb-9 sm:pb-12'>
        <img
          src={logo}
          alt=''
          width={64}
          height={64}
          className='mb-6 size-14 object-contain sm:size-16'
        />
        <h1 className='text-4xl font-semibold tracking-tight sm:text-6xl'>
          {t('About {{name}}', { name: systemName })}
        </h1>
        <p className='text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed'>
          {t(
            'Access models from multiple providers with one API key. Send requests in OpenAI, Anthropic, or Gemini format and track usage across your application.'
          )}
        </p>
      </section>
      {visibleResources.length > 0 && (
        <nav
          aria-label={t('Platform resources')}
          className='mt-8 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]'
        >
          {visibleResources.map(({ to, title, description, icon: Icon }) => (
            <Item
              key={to}
              variant='outline'
              render={<Link to={to} />}
              className='bg-card items-start gap-4 rounded-xl p-5 hover:border-(--delivery-highlight)'
            >
              <ItemHeader>
                <span className='bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg'>
                  <Icon className='size-4' aria-hidden='true' />
                </span>
                <ArrowRight
                  className='text-muted-foreground size-4'
                  aria-hidden='true'
                />
              </ItemHeader>
              <ItemContent className='gap-1.5'>
                <ItemTitle className='text-base font-semibold'>
                  {title}
                </ItemTitle>
                <ItemDescription className='line-clamp-none'>
                  {description}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </nav>
      )}
      <section className='border-border mt-12 space-y-2 border-t pt-6 text-sm'>
        <h2 className='mb-3 text-lg font-semibold'>{t('Open source')}</h2>
        <p>
          {t('New API Project Repository:')}{' '}
          <a
            href='https://github.com/QuantumNous/new-api'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('https://github.com/QuantumNous/new-api')}
          </a>
        </p>
        <p className='text-muted-foreground'>
          <a
            href='https://github.com/QuantumNous/new-api'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('NewAPI')}
          </a>{' '}
          © {currentYear}{' '}
          <a
            href='https://github.com/QuantumNous'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('QuantumNous')}
          </a>{' '}
          {t('| Based on')}{' '}
          <a
            href='https://github.com/songquanpeng/one-api'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('One API')}
          </a>{' '}
          © 2023{' '}
          <a
            href='https://github.com/songquanpeng'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('JustSong')}
          </a>
        </p>
        <p className='text-muted-foreground'>
          {t('This project must be used in compliance with the')}{' '}
          <a
            href='https://github.com/QuantumNous/new-api/blob/main/LICENSE'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {t('AGPL v3.0 License')}
          </a>
          .
        </p>
      </section>
    </main>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => requireServerSuccess(await getAboutContent()),
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isHttpUrl(rawContent)
  const contentIsHtml = hasContent && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout showMainContainer={false} className='delivery-public'>
        <DefaultAbout />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
          sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'
        />
      </PublicLayout>
    )
  }

  if (contentIsHtml) {
    return (
      <PublicLayout showMainContainer={false}>
        <RichContent
          mode='html'
          htmlVariant='isolated'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <RichContent
          mode='markdown'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
      </div>
    </PublicLayout>
  )
}
