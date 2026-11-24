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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { PublicNavigation } from '@/components/layout/components/public-navigation'

import { Hero } from '../components/sections/hero'

const clients: QueryClient[] = []

function renderHero(
  isAuthenticated: boolean,
  docs = 'https://docs.example.test'
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  clients.push(client)
  client.setQueryData(['status'], { docs_link: docs })
  const root = createRootRoute({
    component: () => (
      <>
        <PublicNavigation />
        <Hero isAuthenticated={isAuthenticated} />
      </>
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

afterEach(() => {
  clients.splice(0).forEach((client) => client.clear())
  localStorage.clear()
})

it('opens the built-in docs even when the server advertises external documentation', async () => {
  renderHero(false)
  expect(
    await screen.findByRole('heading', {
      level: 2,
      name: 'Build on your API gateway in minutes',
    })
  ).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Get Started' })).toHaveAttribute(
    'href',
    '/sign-up'
  )
  expect(
    screen.queryByRole('button', { name: 'View Pricing' })
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Docs' })).toHaveAttribute(
    'href',
    '/docs'
  )
  const docsNavLink = screen.getByRole('link', { name: 'Docs' })
  expect(docsNavLink).toHaveAttribute('href', '/docs')
  expect(docsNavLink).not.toHaveAttribute('target', '_blank')
  expect(screen.getByRole('link', { name: /Cherry Studio/ })).toHaveAttribute(
    'href',
    'https://cherry-ai.com'
  )
})

it('returns signed-in users to the unchanged dashboard instead of signup', async () => {
  renderHero(true)
  expect(
    await screen.findByRole('button', { name: 'Go to Dashboard' })
  ).toHaveAttribute('href', '/dashboard')
  expect(
    screen.queryByRole('button', { name: 'Get Started' })
  ).not.toBeInTheDocument()
})
