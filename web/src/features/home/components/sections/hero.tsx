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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  primary?: boolean
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const Heading = props.primary ? 'h1' : 'h2'
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <section
      className={
        props.primary
          ? 'relative z-10 px-6 pt-32 pb-16'
          : 'relative z-10 px-6 py-12 md:py-16 lg:py-20'
      }
    >
      <div className='mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12'>
        <div className='flex flex-col items-start text-left lg:col-span-5'>
          <Heading className='text-2xl leading-tight font-semibold tracking-tight md:text-3xl'>
            {t('Build on your API gateway in minutes')}
          </Heading>
          <p className='text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed md:text-base'>
            {t(
              'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
            )}
          </p>

          <div className='mt-6 flex flex-wrap items-center gap-3'>
            {props.isAuthenticated ? (
              <>
                <Button
                  className='group h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/dashboard' />}
                >
                  {t('Go to Dashboard')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                {renderDocsButton()}
              </>
            ) : (
              <>
                <Button
                  className='group h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/sign-up' />}
                >
                  {t('Get Started')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                {renderDocsButton()}
              </>
            )}
          </div>

          <div className='border-border/60 mt-8 w-full max-w-xl border-t pt-5'>
            <h3 className='text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase'>
              {t('Supported Applications')}
            </h3>
            <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
              {t(
                'Supports one-click configuration and perfectly adapts to NewAPI multi-protocol configuration.'
              )}
            </p>
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <a
                href='https://cherry-ai.com'
                target='_blank'
                rel='noopener noreferrer'
                className='border-border/70 bg-background flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors hover:border-amber-500/50 hover:bg-amber-500/5'
              >
                <CherryStudio.Color size={20} className='shrink-0' />
                <span>Cherry Studio</span>
              </a>

              <a
                href='https://ccswitch.io'
                target='_blank'
                rel='noopener noreferrer'
                className='border-border/70 bg-background flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors hover:border-amber-500/50 hover:bg-amber-500/5'
              >
                <img
                  src='https://ccswitch.io/favicon.png'
                  alt='CC Switch'
                  className='size-5 shrink-0 rounded-md object-contain'
                  onError={(e) => {
                    // Fallback to a styled text avatar if the remote favicon fails to load in sandbox or local environments
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <span
                  style={{ display: 'none' }}
                  className='size-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-[10px] font-bold text-amber-700 dark:text-amber-300'
                >
                  CC
                </span>
                <span>CC Switch</span>
              </a>
            </div>
          </div>
        </div>

        <div className='flex w-full justify-center lg:col-span-7'>
          <HeroTerminalDemo className='delivery-terminal w-full' />
        </div>
      </div>
    </section>
  )
}
