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
import { ArrowRight, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CodeBlockFrame } from '@/components/ai-elements/code-block'
import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'

import { curlExample, getEndpoints, type DocsTopic } from './topics'

function Snippet(props: { label: string; code: string }) {
  const { t } = useTranslation()
  return (
    <CodeBlockFrame
      showToolbar
      className='bg-card my-4 rounded-xl'
      title={
        <span className='flex items-center gap-2'>
          <Terminal aria-hidden='true' className='size-3.5' />
          {props.label}
        </span>
      }
      endActions={
        <CopyButton
          aria-label={t('Copy {{label}}', { label: props.label })}
          value={props.code}
          size='sm'
          className='size-8'
        />
      }
    >
      <pre className='p-4 text-[0.8rem] leading-6 sm:px-5'>
        <code>{props.code}</code>
      </pre>
    </CodeBlockFrame>
  )
}

export function DocsArticle(props: { topic: DocsTopic; origin: string }) {
  const { t } = useTranslation()
  const endpoints = getEndpoints(t)
  const exportKey = 'export BRAINBUTTER_API_KEY="YOUR_API_KEY"'
  const keyNote = t(
    'Set BRAINBUTTER_API_KEY in your local shell or secret manager. Keep the key on your server and out of browser code.'
  )
  const modelNote = t(
    'Replace MODEL_ID with an ID returned for your key. Choose a model that supports this endpoint in Model Square.'
  )
  const keyLink = (
    <Button size='sm' variant='outline' render={<Link to='/keys' />}>
      {t('Open API Keys')}
      <ArrowRight aria-hidden='true' />
    </Button>
  )

  if (props.topic === 'quick-start') {
    return (
      <div className='space-y-7 pt-5'>
        <p className='text-muted-foreground leading-relaxed'>
          {t(
            'Make your first request to BrainButter AI from a terminal. You will need an account, an API key, and a model available to that key.'
          )}
        </p>
        <section>
          <h2 className='mb-2 text-xl font-semibold'>
            {t('1. Create an API key')}
          </h2>
          <p className='mb-3'>
            {t(
              'Sign in, open API Keys, and select Create API Key. Copy the key, then replace YOUR_API_KEY below.'
            )}
          </p>
          {keyLink}
          <Snippet label={t('Shell environment')} code={exportKey} />
        </section>
        <section>
          <h2 className='mb-2 text-xl font-semibold'>{t('2. Find a model')}</h2>
          <p>
            {t(
              'List the models your key can access. Copy a chat model ID from the data array for the next step.'
            )}
          </p>
          <Snippet
            label={t('List models')}
            code={curlExample(props.origin, endpoints.models)}
          />
        </section>
        <section>
          <h2 className='mb-2 text-xl font-semibold'>
            {t('3. Send a message')}
          </h2>
          <p>
            {t(
              'Replace MODEL_ID with the ID you copied, then run the request. Read the reply in choices[0].message.content.'
            )}
          </p>
          <Snippet
            label={t('Chat Completions')}
            code={curlExample(props.origin, endpoints.chat)}
          />
        </section>
      </div>
    )
  }
  if (props.topic === 'api-keys') {
    return (
      <div className='space-y-6 pt-5'>
        <section>
          <h2 className='mb-2 text-xl font-semibold'>{t('Your API key')}</h2>
          <p className='mb-3'>{keyNote}</p>
          {keyLink}
          <Snippet label={t('Shell environment')} code={exportKey} />
        </section>
        <section>
          <h2 className='mb-2 text-xl font-semibold'>{t('Base URL')}</h2>
          <p>
            {t(
              'Paste this base URL into an OpenAI-compatible SDK or client. The SDK appends the endpoint path.'
            )}
          </p>
          <Snippet
            label={t('OpenAI-compatible base URL')}
            code={`${props.origin}/v1`}
          />
          <p>
            {t(
              'For raw HTTP requests, start at the gateway origin below and append the full path shown in the API reference.'
            )}
          </p>
          <Snippet label={t('Gateway origin')} code={props.origin} />
        </section>
      </div>
    )
  }
  if (props.topic === 'errors') {
    const errors = [
      [
        '400',
        t('Invalid request'),
        t(
          'Check that your JSON is valid and includes the required fields for the endpoint.'
        ),
      ],
      [
        '401',
        t('Unauthorized'),
        t(
          'Check the key and its authentication header. Use a BrainButter AI API key that is active and has not expired.'
        ),
      ],
      [
        '403',
        t('Access denied'),
        t(
          'Check the error message, wallet balance, and key restrictions on models, group, and IP addresses.'
        ),
      ],
      [
        '429',
        t('Rate limited'),
        t(
          'Reduce concurrency and wait before retrying. Honor Retry-After when it is present.'
        ),
      ],
      [
        '503',
        t('Service unavailable'),
        t(
          'Check that the model is enabled for your group and supports this endpoint. Retry temporary service failures after a delay.'
        ),
      ],
    ]
    return (
      <div className='pt-5'>
        <p className='text-muted-foreground mb-5'>
          {t(
            'Read the error message alongside the HTTP status. Use the request ID to find the matching entry in Usage Logs.'
          )}
        </p>
        <dl className='divide-border border-border bg-card divide-y rounded-xl border px-5'>
          {errors.map(([code, title, description]) => (
            <div key={code} className='py-4'>
              <dt className='flex items-center gap-2.5 font-semibold'>
                <code className='bg-accent text-accent-foreground rounded px-2 py-0.5 text-sm'>
                  {code}
                </code>
                {title}
              </dt>
              <dd className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    )
  }
  const endpoint = endpoints[props.topic]
  const method = 'body' in endpoint ? 'POST' : 'GET'
  return (
    <div className='space-y-6 pt-5'>
      <p className='text-muted-foreground leading-relaxed'>
        {endpoint.description}
      </p>
      <div className='border-border bg-card flex items-baseline gap-3 rounded-xl border p-4 font-mono text-sm'>
        <span className='bg-accent text-accent-foreground rounded px-2 py-1 font-semibold'>
          {method}
        </span>
        <code className='min-w-0 break-all'>{endpoint.path}</code>
      </div>
      <section>
        <h2 className='mb-2 text-xl font-semibold'>{t('Request')}</h2>
        <p>{method === 'GET' ? keyNote : modelNote}</p>
        <Snippet label='cURL' code={curlExample(props.origin, endpoint)} />
      </section>
      <section>
        <h2 className='mb-2 text-xl font-semibold'>{t('Read the response')}</h2>
        <code className='bg-muted inline-block rounded px-2 py-1 text-sm'>
          {endpoint.result}
        </code>
        <p className='mt-2'>{endpoint.note}</p>
        <Snippet
          label={t('Example response excerpt')}
          code={JSON.stringify(endpoint.response, null, 2)}
        />
      </section>
      <Link
        to='/pricing'
        className='inline-flex items-center gap-1 text-sm font-medium text-(--delivery-highlight) underline underline-offset-4'
      >
        {t('Explore Model Square')}
        <ArrowRight className='size-4' aria-hidden='true' />
      </Link>
    </div>
  )
}
