import { createContext, useContext } from 'react'

export type SheetKind = 'add' | 'budget' | 'goal' | 'goalContribute' | 'category' | 'categorySelect' | 'tbank' | null

export interface AppCtx {
  openSheet: (k: SheetKind, payload?: any) => void
  showToast: (msg: string) => void
  goTab: (t: string) => void
}

export const AppContext = createContext<AppCtx>({
  openSheet: () => {},
  showToast: () => {},
  goTab: () => {},
})

export const useApp = () => useContext(AppContext)
