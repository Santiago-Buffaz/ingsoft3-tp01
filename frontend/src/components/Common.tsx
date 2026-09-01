import type { ReactNode } from 'react'
import { etiquetas } from '../utils'

export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{etiquetas[value] ?? value}</span>
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span>◇</span><strong>{title}</strong><p>{text}</p></div>
}

export function Loading() {
  return <div className="loading"><span /> Cargando información…</div>
}

export function Feedback({ type, children }: { type: 'error' | 'success'; children: ReactNode }) {
  return <div className={`feedback ${type}`} role="status">{type === 'success' ? '✓' : '!'} {children}</div>
}
