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
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { PublicHeader } from '../public-header'

let client: QueryClient

afterEach(() => {
  client?.clear()
  localStorage.clear()
})

it('exposes the mobile menu only while open and closes it after navigation', async () => {
  const user = userEvent.setup()
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(['status'], {
    HeaderNavModules: JSON.stringify({
      home: true,
      console: false,
      pricing: { enabled: true, requireAuth: false },
      docs: false,
      about: false,
    }),
  })
  client.setQueryData(['notice'], { success: true, data: '' })
  const root = createRootRoute({
    component: () => (
      <PublicHeader
        showThemeSwitch={false}
        showNotifications={false}
        showAuthButtons={false}
      />
    ),
  })
  const pricing = createRoute({ getParentRoute: () => root, path: '/pricing' })
  const router = createRouter({
    routeTree: root.addChildren([pricing]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )

  const toggle = await screen.findByRole('button', {
    name: 'Toggle navigation menu',
  })
  const menu = document.querySelector<HTMLElement>(
    `#${toggle.getAttribute('aria-controls')}`
  )
  if (!menu) throw new Error('Missing mobile navigation')
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(menu).toHaveAttribute('inert')
  expect(menu).toHaveAttribute('aria-hidden', 'true')

  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(menu).not.toHaveAttribute('inert')
  expect(menu).toHaveAttribute('aria-hidden', 'false')
  expect(document.body.style.overflow).toBe('hidden')

  await user.click(within(menu).getByRole('link', { name: 'Model Square' }))
  expect(router.state.location.pathname).toBe('/pricing')
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(menu).toHaveAttribute('inert')
  expect(document.body.style.overflow).toBe('')
})
