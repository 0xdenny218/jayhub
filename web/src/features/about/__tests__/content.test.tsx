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
import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { useSystemConfigStore } from '@/stores/system-config-store'

import { About } from '../index'

let client: QueryClient
const initialConfig = useSystemConfigStore.getState().config

function renderAbout(content: string, modules = {}) {
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  client.setQueryData(['status'], {
    system_name: 'BrainButter AI',
    HeaderNavModules: JSON.stringify(modules),
  })
  client.setQueryData(['notice'], { success: true, data: '' })
  client.setQueryData(['about-content'], { success: true, data: content })
  useSystemConfigStore.getState().setConfig({ systemName: 'BrainButter AI' })
  const router = createRouter({
    routeTree: createRootRoute({ component: About }),
    history: createMemoryHistory(),
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

afterEach(() => {
  client.clear()
  useSystemConfigStore.setState({ config: initialConfig })
  localStorage.clear()
})

it('shows the branded introduction and local resources when the About setting is blank', async () => {
  renderAbout('  ')
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'About BrainButter AI',
    })
  ).toBeVisible()
  const resources = within(
    screen.getByRole('navigation', { name: 'Platform resources' })
  )
  expect(
    resources.getByRole('link', { name: /Developer docs/ })
  ).toHaveAttribute('href', '/docs')
  expect(resources.getByRole('link', { name: /Model Square/ })).toHaveAttribute(
    'href',
    '/pricing'
  )
  expect(screen.getByRole('link', { name: 'AGPL v3.0 License' })).toBeVisible()
})

it('renders administrator Markdown in place of the default introduction', async () => {
  renderAbout('# Our team')
  expect(await screen.findByRole('heading', { name: 'Our team' })).toBeVisible()
  expect(
    screen.queryByRole('navigation', { name: 'Platform resources' })
  ).not.toBeInTheDocument()
})

it('embeds an administrator URL when one is configured', async () => {
  renderAbout('https://company.example/about')
  await waitFor(() =>
    expect(document.querySelector('iframe[title="About"]')).toHaveAttribute(
      'src',
      'https://company.example/about'
    )
  )
  expect(
    screen.queryByRole('navigation', { name: 'Platform resources' })
  ).not.toBeInTheDocument()
})

it('omits a resource when its navigation module is disabled', async () => {
  renderAbout('', { pricing: { enabled: false }, docs: true })
  const resources = within(
    await screen.findByRole('navigation', { name: 'Platform resources' })
  )
  expect(
    resources.queryByRole('link', { name: /Model Square/ })
  ).not.toBeInTheDocument()
  expect(
    resources.getByRole('link', { name: /Developer docs/ })
  ).toHaveAttribute('href', '/docs')
})
