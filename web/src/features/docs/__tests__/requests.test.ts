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
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect, it } from 'vitest'

import i18n from '@/i18n/config'

import { curlExample, getEndpoints } from '../topics'

const reference = JSON.parse(
  readFileSync(resolve('../docs/openapi/relay.json'), 'utf8')
)
const endpoints = getEndpoints(i18n.getFixedT('en'))

it.each([
  ['models', 'get', 'Authorization: Bearer', null],
  ['chat', 'post', 'Authorization: Bearer', 'messages'],
  ['responses', 'post', 'Authorization: Bearer', 'input'],
  ['messages', 'post', 'x-api-key:', 'max_tokens'],
  ['gemini', 'post', 'x-goog-api-key:', 'contents'],
] as const)(
  'documents a supported %s route with a copyable request to the current gateway',
  (topic, method, auth, field) => {
    const endpoint = endpoints[topic]
    const command = curlExample('https://gateway.example', endpoint)
    expect(reference.paths[endpoint.path][method]).toBeDefined()
    expect(command.split('\n')[0]).toContain(
      `"https://gateway.example${endpoint.path.replace('{model}', 'MODEL_ID')}"`
    )
    expect(command).toContain(`-H "${auth} $BRAINBUTTER_API_KEY"`)
    if (field) {
      const body = JSON.parse(command.split("  -d '")[1].slice(0, -1))
      expect(body).toHaveProperty(field)
      if (topic !== 'gemini') expect(body.model).toBe('MODEL_ID')
      if (topic === 'messages') {
        expect(command).toContain('anthropic-version: 2023-06-01')
      }
    } else {
      expect(command).not.toContain(' -d ')
    }
  }
)
