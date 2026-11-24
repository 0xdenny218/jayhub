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
import { type RefObject, useEffect, useState } from 'react'

/**
 * Resolve a theme color token (e.g. `--foreground`) to an `rgba()` string a
 * canvas chart can draw with. Read from the chart scope or the body to respect
 * the active palette, and normalize through a canvas because tokens are written
 * as `oklch()` / `color-mix()`, which chart libraries do not parse.
 */
export function resolveThemeColor(
  cssVariable: string,
  scope?: HTMLElement
): string | undefined {
  if (typeof document === 'undefined') return undefined

  const probe = document.createElement('div')
  probe.style.color = `var(${cssVariable})`
  probe.style.display = 'none'
  const parent = scope ?? document.body
  parent.appendChild(probe)
  const computedColor = getComputedStyle(probe).color
  probe.remove()
  if (!computedColor) return undefined

  const context = document.createElement('canvas').getContext('2d')
  if (!context) return computedColor
  context.fillStyle = computedColor
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
  return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(2)})`
}

/**
 * Track a theme color token. The light/dark class on `<html>` and the theme
 * preset attribute on `<body>` are applied by provider effects that run after
 * this hook's, so the color is re-resolved when either attribute changes.
 */
export function useThemeColor(
  cssVariable: string,
  scope?: RefObject<HTMLElement | null>
): string | undefined {
  const [color, setColor] = useState<string | undefined>()

  useEffect(() => {
    const update = () =>
      setColor(resolveThemeColor(cssVariable, scope?.current ?? undefined))
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme-preset'],
    })
    return () => observer.disconnect()
  }, [cssVariable, scope])

  return color
}
