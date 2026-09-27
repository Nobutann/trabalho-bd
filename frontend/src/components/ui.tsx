import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  detail?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, detail, action, children, className = '' }: PanelProps) {
  return (
    <section className={`border border-[#2b4961] bg-[#112438] ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b4961] bg-[#192f45] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[#e4f1fa]">{title}</h2>
          {detail && <p className="mt-0.5 text-xs text-[#96afc0]">{detail}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-[#9bb0bf]">{children}</p>
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-[#8b5258] bg-[#3b2632] px-4 py-3 text-sm text-[#ffd4d6]">
      {message}
    </div>
  )
}

export function Availability({ available }: { available: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${available ? 'text-[#a8d7ba]' : 'text-[#b4bac7]'}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${available ? 'bg-[#7cc59c]' : 'bg-[#8d98a6]'}`} />
      {available ? 'Disponível' : 'Indisponível'}
    </span>
  )
}

export const fieldClass = 'w-full rounded-sm border border-[#35546a] bg-[#0d1b2b] px-3 py-2 text-sm text-[#e8f0f6] outline-none transition-colors placeholder:text-[#668095] focus:border-[#76b7db] focus:ring-1 focus:ring-[#76b7db]'
export const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-sm border border-[#76b7db] bg-[#3b779c] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4e8db2] disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-sm border border-[#42627a] bg-[#1b344a] px-3 py-2 text-sm font-medium text-[#d1e3ef] transition-colors hover:bg-[#294860] disabled:cursor-not-allowed disabled:opacity-50'
export const tableClass = 'w-full min-w-[600px] border-collapse text-left text-sm'
export const tableHeadClass = 'border-b border-[#34526a] bg-[#102237] text-xs font-semibold uppercase tracking-wider text-[#9cb9cc]'
export const tableRowClass = 'border-b border-[#263e52] last:border-b-0 hover:bg-[#1a3248]'
