declare module 'highlight.js' {
  export function highlight(code: string, options: { language: string }): { value: string }
  export function highlightAuto(code: string): { value: string }
  export function getLanguage(lang: string): boolean | undefined
  export function registerLanguage(lang: string, definition: unknown): void
}