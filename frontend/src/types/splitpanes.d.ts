declare module 'splitpanes' {
  import { DefineComponent } from 'vue'

  export interface PaneProps {
    size?: number
    minSize?: number
    maxSize?: number
    class?: string
  }

  export interface SplitpanesProps {
    class?: string
    horizontal?: boolean
    pushOtherPanes?: boolean
    dblClickSplitter?: boolean
    rtl?: boolean
    firstSplitter?: boolean
  }

  export const Splitpanes: DefineComponent<SplitpanesProps>
  export const Pane: DefineComponent<PaneProps>
}

declare module 'splitpanes/dist/splitpanes.css' {}