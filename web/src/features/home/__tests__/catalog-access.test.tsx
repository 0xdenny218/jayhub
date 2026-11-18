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
import { render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Home } from '../index'

const testState = vi.hoisted(() => ({
  homeContent: { content: '', isLoaded: true, isUrl: false },
  pricingCalls: [] as { enabled: boolean; viewer: unknown }[],
  statusQuery: {
    data: undefined as Record<string, unknown> | null | undefined,
    isPending: false,
    isError: false,
  },
  user: null as { id: number } | null,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => testState.statusQuery,
}))

vi.mock('@/lib/status-query', () => ({
  readCachedStatus: () => null,
  statusQueryOptions: { queryKey: ['status'] },
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (
    selector?: (state: { auth: { user: { id: number } | null } }) => unknown
  ) => {
    const state = { auth: { user: testState.user } }
    return selector ? selector(state) : state
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: (props: PropsWithChildren<{ to: string }>) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

vi.mock('@/context/theme-provider', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/layout', () => ({
  PublicLayout: (props: PropsWithChildren) => <div>{props.children}</div>,
}))

vi.mock('@/components/layout/components/footer', () => ({
  Footer: () => <footer>Footer</footer>,
}))

vi.mock('@/components/rich-content', () => ({
  RichContent: () => <div>Custom home page</div>,
}))

vi.mock('../components', () => ({
  CTA: () => null,
  Features: () => null,
  Hero: () => null,
  HowItWorks: () => null,
  Stats: () => null,
}))

vi.mock('@/features/pricing/hooks/use-pricing-data', () => ({
  usePricingData: (enabled: boolean, viewer: unknown) => {
    testState.pricingCalls.push({ enabled, viewer })
    return {
      models: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      priceRate: 1,
      usdExchangeRate: 1,
    }
  },
}))

vi.mock('@/features/pricing/components/model-price-cell', () => ({
  ModelPriceCell: () => null,
}))

vi.mock('../hooks', () => ({
  useHomePageContent: () => testState.homeContent,
}))

function setPricingAccess(enabled: boolean, requireAuth: boolean): void {
  testState.statusQuery.data = {
    HeaderNavModules: { pricing: { enabled, requireAuth } },
  }
}

beforeEach(() => {
  testState.homeContent = { content: '', isLoaded: true, isUrl: false }
  testState.pricingCalls.length = 0
  testState.statusQuery = {
    data: undefined,
    isPending: false,
    isError: false,
  }
  testState.user = null
})

describe('home model catalog access', () => {
  it('shows the public catalog when pricing is enabled without authentication', () => {
    setPricingAccess(true, false)

    render(<Home />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Model directory' })
    ).toBeVisible()
    expect(screen.getByText('No models available')).toBeVisible()
    expect(testState.pricingCalls).toEqual([{ enabled: true, viewer: null }])
  })

  it('shows the sign-in guide instead of the catalog to a signed-out visitor when pricing requires authentication', () => {
    setPricingAccess(true, true)

    render(<Home />)

    expect(
      screen.getByText('Sign in to explore the model directory.')
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    )
    expect(screen.queryByText('No models available')).not.toBeInTheDocument()
    expect(testState.pricingCalls).toEqual([{ enabled: false, viewer: null }])
  })

  it('shows an authenticated user the catalog when pricing requires authentication', () => {
    setPricingAccess(true, true)
    testState.user = { id: 7 }

    render(<Home />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Model directory' })
    ).toBeVisible()
    expect(testState.pricingCalls).toEqual([
      { enabled: true, viewer: { id: 7 } },
    ])
  })

  it.each([
    {
      name: 'pricing is disabled',
      prepare: () => setPricingAccess(false, false),
    },
    {
      name: 'status data is missing',
      prepare: () => {
        testState.statusQuery.data = undefined
      },
    },
    {
      name: 'status is pending',
      prepare: () => {
        testState.statusQuery.isPending = true
      },
    },
    {
      name: 'status failed',
      prepare: () => {
        testState.statusQuery.isError = true
      },
    },
  ])('does not mount the catalog while $name', ({ prepare }) => {
    prepare()

    render(<Home />)

    expect(
      screen.queryByRole('heading', { level: 1, name: 'Model directory' })
    ).not.toBeInTheDocument()
    expect(testState.pricingCalls).toEqual([])
  })

  it('does not mount the catalog on a custom home page', () => {
    setPricingAccess(true, false)
    testState.homeContent = {
      content: '# Operator home page',
      isLoaded: true,
      isUrl: false,
    }

    render(<Home />)

    expect(screen.getByText('Custom home page')).toBeVisible()
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Model directory' })
    ).not.toBeInTheDocument()
    expect(testState.pricingCalls).toEqual([])
  })
})
