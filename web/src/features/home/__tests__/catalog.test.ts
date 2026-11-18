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
import { describe, expect, it } from 'vitest'

import type { PricingModel } from '@/features/pricing/types'

import { filterCatalog } from '../lib/catalog'

function model(
  id: number,
  modelName: string,
  overrides: Partial<PricingModel> = {}
): PricingModel {
  return {
    id,
    model_name: modelName,
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    ...overrides,
  }
}

describe('filterCatalog', () => {
  it('keeps source order and lets a multi-endpoint model appear in each matching category', () => {
    const models = [
      model(1, 'unknown'),
      model(2, 'multimodal', {
        supported_endpoint_types: ['openai', 'image-generation'],
      }),
      model(3, 'chat', { supported_endpoint_types: ['anthropic'] }),
      model(4, 'image', {
        supported_endpoint_types: ['image-generation'],
      }),
    ]

    expect(filterCatalog(models, '', 'all')).toEqual(models)
    expect(filterCatalog(models, '', 'text').map((item) => item.id)).toEqual([
      2, 3,
    ])
    expect(filterCatalog(models, '', 'image').map((item) => item.id)).toEqual([
      2, 4,
    ])
  })

  it('recognizes canonical and task-plugin image and video endpoint identities', () => {
    const models = [
      model(1, 'canonical-video', {
        supported_endpoint_types: ['openai-video'],
      }),
      model(2, 'plugin-video', {
        supported_endpoint_types: ['openai_video'],
      }),
      model(3, 'plugin-image', {
        supported_endpoint_types: ['openai_image'],
      }),
      model(4, 'plugin-text', {
        supported_endpoint_types: ['openai_responses'],
      }),
    ]

    expect(filterCatalog(models, '', 'video').map((item) => item.id)).toEqual([
      1, 2,
    ])
    expect(filterCatalog(models, '', 'image').map((item) => item.id)).toEqual([
      3,
    ])
    expect(filterCatalog(models, '', 'text').map((item) => item.id)).toEqual([
      4,
    ])
  })

  it('uses explicit category tags but does not infer a category from model or vendor names', () => {
    const models = [
      model(1, 'video-by-name-only', { vendor_name: 'Image Vendor' }),
      model(2, 'opaque-a', { tags: 'Featured, VIDEO' }),
      model(3, 'opaque-b', { tags: 'chat;featured' }),
    ]

    expect(filterCatalog(models, '', 'video').map((item) => item.id)).toEqual([
      2,
    ])
    expect(filterCatalog(models, '', 'text').map((item) => item.id)).toEqual([
      3,
    ])
    expect(filterCatalog(models, '', 'image')).toEqual([])
  })

  it('prefers output capabilities, ignores input-only modalities, and accepts explicit Chinese tags', () => {
    const models = [
      model(1, 'image-output-over-chat-endpoint', {
        output_modalities: ['image'],
        supported_endpoint_types: ['openai'],
        tags: 'text',
      }),
      model(2, 'image-input-only', {
        input_modalities: ['image'],
        supported_endpoint_types: ['openai'],
      }),
      model(3, 'tagged-image', { tags: '图片生成' }),
      model(4, 'tagged-video', { tags: '视频生成' }),
      model(5, 'tagged-chat', { tags: '对话' }),
    ]

    expect(filterCatalog(models, '', 'text').map((item) => item.id)).toEqual([
      2, 5,
    ])
    expect(filterCatalog(models, '', 'image').map((item) => item.id)).toEqual([
      1, 3,
    ])
    expect(filterCatalog(models, '', 'video').map((item) => item.id)).toEqual([
      4,
    ])
  })

  it('combines case-insensitive pricing search fields with the category filter', () => {
    const models = [
      model(1, 'alpha-chat', {
        description: 'Fast Assistant',
        vendor_name: 'Acme Labs',
        tags: 'Featured',
        supported_endpoint_types: ['openai-response'],
      }),
      model(2, 'alpha-image', {
        description: 'Fast canvas',
        vendor_name: 'Acme Labs',
        tags: 'Featured',
        supported_endpoint_types: ['image-generation'],
      }),
      model(3, 'other-chat', {
        vendor_name: 'Other',
        supported_endpoint_types: ['openai'],
      }),
    ]

    expect(
      filterCatalog(models, 'ACME LABS', 'text').map((item) => item.id)
    ).toEqual([1])
    expect(
      filterCatalog(models, 'fast', 'image').map((item) => item.id)
    ).toEqual([2])
    expect(
      filterCatalog(models, 'FEATURED', 'all').map((item) => item.id)
    ).toEqual([1, 2])
  })
})
