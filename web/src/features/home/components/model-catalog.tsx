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
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Film,
  Image,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Plus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { ModelPriceCell } from '@/features/pricing/components/model-price-cell'
import { SearchBar } from '@/features/pricing/components/search-bar'
import { usePricingData } from '@/features/pricing/hooks/use-pricing-data'
import { getLobeIcon } from '@/lib/lobe-icon'
import { useAuthStore } from '@/stores/auth-store'

import {
  filterCatalog,
  modelMatchesCategory,
  type CatalogCategory,
} from '../lib/catalog'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers3 },
  { id: 'text', label: 'Text', icon: MessageSquareText },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'video', label: 'Video', icon: Film },
] as const
const PAGE_SIZE = 6

export function ModelCatalog({ locked }: { locked: boolean }) {
  const { t } = useTranslation()
  const viewer = useAuthStore((state) => state.auth.user)
  const { models, isLoading, error, refetch, priceRate, usdExchangeRate } =
    usePricingData(!locked, viewer)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CatalogCategory>('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const matches = useMemo(
    () => filterCatalog(models, search.trim(), category),
    [models, search, category]
  )

  function updateSearch(value: string) {
    setSearch(value)
    setLimit(PAGE_SIZE)
  }

  let results
  if (locked) {
    results = null
  } else if (isLoading) {
    results = (
      <div
        role='status'
        aria-label={t('Loading...')}
        className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      >
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <div
            key={i}
            className='bg-muted h-40 rounded-xl motion-safe:animate-pulse'
          />
        ))}
      </div>
    )
  } else if (error) {
    results = (
      <div role='status' className='delivery-catalog-empty'>
        <p>{t('Could not load model prices.')}</p>
        <Button variant='outline' onClick={() => void refetch()}>
          {t('Retry')}
        </Button>
      </div>
    )
  } else if (matches.length === 0) {
    results = (
      <div role='status' className='delivery-catalog-empty'>
        <p>
          {models.length
            ? t('No models match your search')
            : t('No models available')}
        </p>
        {!!models.length && (
          <Button
            variant='outline'
            onClick={() => {
              updateSearch('')
              setCategory('all')
            }}
          >
            {t('Clear filters')}
          </Button>
        )}
      </div>
    )
  } else {
    results = (
      <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {matches.slice(0, limit).map((model) => (
          <li key={model.model_name} className='min-w-0'>
            <Link
              to='/pricing/$modelId'
              params={{ modelId: model.model_name }}
              aria-label={model.model_name}
              className='delivery-model-card group'
            >
              <div className='flex min-w-0 items-center gap-2.5'>
                <div className='delivery-model-icon' aria-hidden='true'>
                  {model.icon || model.vendor_icon ? (
                    getLobeIcon(model.icon || model.vendor_icon, 25)
                  ) : (
                    <Boxes size={22} />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-muted-foreground truncate text-xs'>
                    {[
                      model.vendor_name,
                      ...CATEGORIES.filter(
                        ({ id }) =>
                          id !== 'all' && modelMatchesCategory(model, id)
                      ).map(({ label }) => t(label)),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <h2
                    className='text-foreground text-base leading-snug font-semibold break-all'
                    title={model.model_name}
                  >
                    {model.model_name}
                  </h2>
                </div>
                <ArrowUpRight
                  size={16}
                  aria-hidden='true'
                  className='text-muted-foreground shrink-0 self-start'
                />
              </div>
              <div className='border-border mt-4 border-t pt-3'>
                <ModelPriceCell
                  model={model}
                  options={{ priceRate, usdExchangeRate }}
                  showExpression={false}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      className='delivery-catalog border-border border-b'
      aria-labelledby='home-catalog-title'
    >
      <div className='mx-auto max-w-6xl'>
        <div className='delivery-catalog-intro'>
          <div className='relative z-10'>
            <h1
              id='home-catalog-title'
              className='text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl'
            >
              {t('Model directory')}
            </h1>
            <p className='text-muted-foreground mt-3 max-w-xl text-base'>
              {locked
                ? t('Sign in to explore the model directory.')
                : t(
                    'Find models by name or provider and compare their prices.'
                  )}
            </p>
          </div>
          <div className='delivery-catalog-art' aria-hidden='true'>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        {locked ? (
          <Button
            className='mt-5'
            render={<Link to='/sign-in' search={{ redirect: '/' }} />}
          >
            <LockKeyhole />
            {t('Sign in')}
          </Button>
        ) : (
          <>
            <SearchBar
              className='delivery-catalog-search'
              value={search}
              onChange={updateSearch}
              onClear={() => updateSearch('')}
              placeholder={t('Search by model or provider')}
            />
            <div className='delivery-catalog-toolbar'>
              <div
                className='flex flex-wrap gap-1'
                role='group'
                aria-label={t('All categories')}
              >
                {CATEGORIES.map(({ id, label, icon: Icon }) => (
                  <button
                    type='button'
                    key={id}
                    className='delivery-category'
                    aria-pressed={category === id}
                    onClick={() => {
                      setCategory(id)
                      setLimit(PAGE_SIZE)
                    }}
                  >
                    <Icon aria-hidden='true' size={15} />
                    {t(label)}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-4 text-xs sm:text-sm'>
                {!isLoading && !error && (
                  <span
                    aria-live='polite'
                    className='text-muted-foreground whitespace-nowrap'
                  >
                    {t('{{count}} models', { count: matches.length })}
                  </span>
                )}
                <Link className='delivery-pricing-link' to='/pricing'>
                  {t('View Pricing')}
                  <ArrowRight aria-hidden='true' size={15} />
                </Link>
              </div>
            </div>
            <div aria-busy={isLoading}>{results}</div>
            {!error && !isLoading && matches.length > limit && (
              <div className='mt-5 flex justify-center'>
                <Button
                  variant='outline'
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                >
                  <Plus aria-hidden='true' />
                  {t('Load more')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
