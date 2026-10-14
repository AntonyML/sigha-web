import type { CSSProperties } from 'react'

/** Sets the `--i` custom property read by the shared reveal/enter animations to stagger siblings. */
export function stagger(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}
