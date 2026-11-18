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
import { afterEach, expect, test } from 'vitest'

import { useSystemConfigStore } from '@/stores/system-config-store'

import { AuthLayout } from '../auth-layout'

const initialSystemConfig = useSystemConfigStore.getInitialState()

function renderAuthLayout(props: { className?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const rootRoute = createRootRoute({
    component: () => (
      <AuthLayout {...props}>
        <form aria-label='Authentication form'>
          <label htmlFor='email'>Email</label>
          <input id='email' name='email' />
          <button type='submit'>Continue</button>
        </form>
      </AuthLayout>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

afterEach(() => {
  useSystemConfigStore.setState(initialSystemConfig, true)
})

test('keeps the official home brand link and authentication children accessible by default', async () => {
  useSystemConfigStore.getState().setConfig({
    systemName: 'New API',
    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
  })
  useSystemConfigStore.getState().setLoading(false)

  const { container } = renderAuthLayout()

  expect(
    await screen.findByRole('form', { name: 'Authentication form' })
  ).toBeVisible()
  expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Logo New API' })).toHaveAttribute(
    'href',
    '/'
  )
  expect(container.querySelector('.delivery-public')).toBeNull()
})

test('shows the configured operator brand once in the delivery layout', async () => {
  useSystemConfigStore.getState().setConfig({
    systemName: 'Customer Gateway',
    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/>',
  })
  useSystemConfigStore.getState().setLoading(false)

  const { container } = renderAuthLayout({
    className: 'delivery-public delivery-auth',
  })

  expect(
    await screen.findByRole('link', { name: 'Logo Customer Gateway' })
  ).toHaveAttribute('href', '/')
  expect(screen.getAllByText('Customer Gateway')).toHaveLength(1)
  expect(
    container.querySelector('.delivery-public.delivery-auth')
  ).not.toBeNull()
  expect(container.querySelector('.delivery-auth-brand')).not.toBeNull()
  expect(container.querySelector('.delivery-auth-panel')).not.toBeNull()
})
