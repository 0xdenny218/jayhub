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
import type { TFunction } from 'i18next'

export const topics = [
  'quick-start',
  'api-keys',
  'models',
  'chat',
  'responses',
  'messages',
  'gemini',
  'errors',
] as const
export type DocsTopic = (typeof topics)[number]

export function getDocsNavigation(t: TFunction) {
  return [
    {
      title: t('Getting started'),
      items: [
        { id: 'quick-start', title: t('Quick start') },
        { id: 'api-keys', title: t('API keys & base URL') },
      ],
    },
    {
      title: t('API reference'),
      items: [
        { id: 'models', title: t('List models') },
        { id: 'chat', title: t('Chat Completions') },
        { id: 'responses', title: t('Responses') },
        { id: 'messages', title: t('Claude Messages') },
        { id: 'gemini', title: t('Gemini Generate Content') },
      ],
    },
    {
      title: t('Troubleshooting'),
      items: [{ id: 'errors', title: t('Common errors') }],
    },
  ] satisfies { title: string; items: { id: DocsTopic; title: string }[] }[]
}

type EndpointTopic = Exclude<DocsTopic, 'quick-start' | 'api-keys' | 'errors'>

export function getEndpoints(t: TFunction) {
  const bearer = ['Authorization: Bearer $BRAINBUTTER_API_KEY']
  const messages = [{ role: 'user', content: 'Say hello in one sentence.' }]
  return {
    models: {
      path: '/v1/models',
      headers: bearer,
      description: t(
        'List the model IDs available to your API key. The list reflects your group and any restrictions on the key.'
      ),
      result: 'data[].id',
      response: { object: 'list', data: [{ id: 'MODEL_ID', object: 'model' }] },
      note: t(
        'Copy an ID exactly as returned. An empty list means this key currently has no available models.'
      ),
    },
    chat: {
      path: '/v1/chat/completions',
      headers: bearer,
      body: { model: 'MODEL_ID', messages },
      description: t(
        'Send a conversation as an array of messages and receive the next assistant message.'
      ),
      result: 'choices[0].message.content',
      response: {
        choices: [{ message: { role: 'assistant', content: 'Hello!' } }],
      },
      note: t(
        'For a follow-up, include the earlier user and assistant messages in the next request.'
      ),
    },
    responses: {
      path: '/v1/responses',
      headers: bearer,
      body: { model: 'MODEL_ID', input: 'Say hello in one sentence.' },
      description: t(
        'Send a text prompt with the Responses API using a model that supports this endpoint.'
      ),
      result: 'output[].content[].text',
      response: {
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Hello!' }],
          },
        ],
      },
      note: t(
        'Read the message items in output and collect content blocks whose type is output_text.'
      ),
    },
    messages: {
      path: '/v1/messages',
      headers: [
        'x-api-key: $BRAINBUTTER_API_KEY',
        'anthropic-version: 2023-06-01',
      ],
      body: { model: 'MODEL_ID', max_tokens: 256, messages },
      description: t(
        'Send messages in the Anthropic format. Include the API version header and an output token limit.'
      ),
      result: 'content[].text',
      response: { content: [{ type: 'text', text: 'Hello!' }] },
      note: t(
        'The response contains content blocks. Read the text field of each block whose type is text.'
      ),
    },
    gemini: {
      path: '/v1beta/models/{model}:generateContent',
      headers: ['x-goog-api-key: $BRAINBUTTER_API_KEY'],
      body: {
        contents: [
          { role: 'user', parts: [{ text: 'Say hello in one sentence.' }] },
        ],
      },
      description: t(
        'Call a Gemini model with its ID in the URL. The request body contains the conversation as contents and parts.'
      ),
      result: 'candidates[].content.parts[].text',
      response: { candidates: [{ content: { parts: [{ text: 'Hello!' }] } }] },
      note: t(
        'Read the text parts of the returned candidate. A blocked prompt may return feedback without a candidate.'
      ),
    },
  } satisfies Record<EndpointTopic, ReferenceEndpoint>
}

type ReferenceEndpoint = {
  path: string
  headers: string[]
  body?: object
  description: string
  result: string
  response: object
  note: string
}

export function curlExample(origin: string, endpoint: ReferenceEndpoint) {
  const lines = [
    `curl "${origin}${endpoint.path.replace('{model}', 'MODEL_ID')}"`,
    ...endpoint.headers.map((header) => `  -H "${header}"`),
  ]
  if (endpoint.body) {
    lines.push(
      '  -H "Content-Type: application/json"',
      `  -d '${JSON.stringify(endpoint.body, null, 2)}'`
    )
  }
  return lines.join(' \\\n')
}
