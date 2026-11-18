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
import { filterBySearch, parseTags } from '@/features/pricing/lib/filters'
import type { PricingModel } from '@/features/pricing/types'

export type CatalogCategory = 'all' | 'text' | 'image' | 'video'

const CATEGORY_ENDPOINTS: Record<
  Exclude<CatalogCategory, 'all'>,
  ReadonlySet<string>
> = {
  text: new Set([
    'openai',
    'openai-response',
    'openai-response-compact',
    'openai-alpha-search',
    'deepseek-tools-search',
    'deepseek-tools-fetch',
    'anthropic',
    'gemini',
    'jina-rerank',
    'embeddings',
    'openai_responses',
  ]),
  image: new Set(['image-generation', 'openai_image']),
  video: new Set(['openai-video', 'openai_video']),
}

const CATEGORY_TAGS: Record<
  Exclude<CatalogCategory, 'all'>,
  ReadonlySet<string>
> = {
  text: new Set(['text', 'chat', '文本', '对话']),
  image: new Set(['image', '图像', '图片', '图像生成', '图片生成']),
  video: new Set(['video', '视频', '视频生成']),
}

export function modelMatchesCategory(
  model: PricingModel,
  category: Exclude<CatalogCategory, 'all'>
): boolean {
  if (model.output_modalities?.length) {
    return model.output_modalities.includes(category)
  }

  const matchesEndpoint = model.supported_endpoint_types?.some((endpoint) =>
    CATEGORY_ENDPOINTS[category].has(endpoint.trim().toLowerCase())
  )
  if (matchesEndpoint) return true

  return parseTags(model.tags).some((tag) =>
    CATEGORY_TAGS[category].has(tag.toLowerCase())
  )
}

export function filterCatalog(
  models: PricingModel[],
  search: string,
  category: CatalogCategory
): PricingModel[] {
  const searchedModels = filterBySearch(models, search)
  if (category === 'all') return searchedModels

  return searchedModels.filter((model) => modelMatchesCategory(model, category))
}
