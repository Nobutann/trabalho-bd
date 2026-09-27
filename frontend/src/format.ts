import type { Species } from './types'

export function speciesLabel(species: Species): string {
  return species === 'Cao' ? 'Cão' : 'Gato'
}

export function sexLabel(sex: string | null): string {
  return sex === 'Femea' ? 'Fêmea' : sex || '—'
}

export function sizeLabel(size: string | null): string {
  return size === 'Medio' ? 'Médio' : size || '—'
}

export function ageGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    '0-1': '0–1 ano',
    '2-4': '2–4 anos',
    '5+': '5 anos ou mais',
    Unknown: 'Idade não informada',
  }

  return labels[group] || group
}

export function dateLabel(value: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
