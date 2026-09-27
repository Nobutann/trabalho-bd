import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { ageGroupLabel, speciesLabel } from '../format'
import type { Animal, DashboardData } from '../types'
import {
  Availability,
  EmptyState,
  ErrorMessage,
  Panel,
  fieldClass,
  primaryButtonClass,
  tableClass,
  tableHeadClass,
  tableRowClass,
} from '../components/ui'

const reports = [
  { id: 1, title: 'Animais e centros', detail: 'JOIN com centros de adoção e raças' },
  { id: 2, title: 'Resumo por espécie', detail: 'Totais por espécie e situação' },
  { id: 3, title: 'Faixas etárias', detail: 'Distribuição por idade e espécie' },
  { id: 4, title: 'Recomendações', detail: 'Animais conforme preferências do usuário' },
] as const

type ReportId = typeof reports[number]['id']

export function ReportsPage({ data }: { data: DashboardData }) {
  const [activeReport, setActiveReport] = useState<ReportId>(1)
  const [userId, setUserId] = useState('1')
  const [recommended, setRecommended] = useState<Animal[]>([])
  const [recommendationStatus, setRecommendationStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [recommendationError, setRecommendationError] = useState('')

  useEffect(() => {
    let active = true
    api.recommendedAnimals(1)
      .then((animals) => {
        if (active) {
          setRecommended(animals)
          setRecommendationStatus('ready')
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setRecommendationError(cause instanceof Error ? cause.message : 'Não foi possível carregar as recomendações.')
          setRecommendationStatus('error')
        }
      })
    return () => { active = false }
  }, [])

  async function searchRecommendations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedId = Number(userId)
    if (!Number.isInteger(parsedId) || parsedId < 1) return

    setRecommendationStatus('loading')
    setRecommendationError('')
    try {
      setRecommended(await api.recommendedAnimals(parsedId))
      setRecommendationStatus('ready')
    } catch (cause) {
      setRecommendationError(cause instanceof Error ? cause.message : 'Não foi possível carregar as recomendações.')
      setRecommendationStatus('error')
    }
  }

  return (
    <div className="space-y-5">
      <Panel title="Consultas SQL" detail="Resultados das quatro consultas disponíveis na API">
        <div className="grid gap-px bg-[#2b4961] sm:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => setActiveReport(report.id)}
              aria-current={activeReport === report.id ? 'page' : undefined}
              className={`min-h-24 p-4 text-left transition-colors ${activeReport === report.id ? 'bg-[#244562] text-[#e7f3fb]' : 'bg-[#112438] text-[#9bb5c6] hover:bg-[#1b344a]'}`}
            >
              <span className="font-mono text-xs text-[#80bddd]">0{report.id}</span>
              <span className="mt-1 block text-sm font-semibold">{report.title}</span>
              <span className="mt-1 block text-xs leading-5 text-[#8faabc]">{report.detail}</span>
            </button>
          ))}
        </div>
      </Panel>

      {activeReport === 1 && (
        <Panel title="01 · Animais e centros" detail={`${data.animals.length} registros; JOIN entre Animal, Centro_Adocao e Raca`}>
          {data.animals.length === 0 ? <EmptyState>Nenhum animal cadastrado.</EmptyState> : <AnimalResults animals={data.animals} />}
        </Panel>
      )}

      {activeReport === 2 && (
        <Panel title="02 · Resumo por espécie" detail="Quantidade total, disponível e indisponível por espécie">
          {data.speciesSummary.length === 0 ? <EmptyState>Não há dados para esta consulta.</EmptyState> : (
            <div className="overflow-x-auto"><table className={tableClass}>
              <thead className={tableHeadClass}><tr><th className="px-4 py-2.5">Espécie</th><th className="px-4 py-2.5">Total</th><th className="px-4 py-2.5">Disponíveis</th><th className="px-4 py-2.5">Indisponíveis</th></tr></thead>
              <tbody>{data.speciesSummary.map((row) => <tr key={row.species} className={tableRowClass}>
                <td className="px-4 py-2.5 text-[#b7dbf0]">{speciesLabel(row.species)}</td>
                <td className="px-4 py-2.5 font-mono">{row.total}</td>
                <td className="px-4 py-2.5 font-mono">{row.available}</td>
                <td className="px-4 py-2.5 font-mono">{row.unavailable}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </Panel>
      )}

      {activeReport === 3 && (
        <Panel title="03 · Faixas etárias" detail="Idade calculada no banco a partir da data de nascimento">
          {data.ageGroupSummary.length === 0 ? <EmptyState>Não há dados para esta consulta.</EmptyState> : (
            <div className="overflow-x-auto"><table className={tableClass}>
              <thead className={tableHeadClass}><tr><th className="px-4 py-2.5">Espécie</th><th className="px-4 py-2.5">Faixa etária</th><th className="px-4 py-2.5">Animais</th></tr></thead>
              <tbody>{data.ageGroupSummary.map((row) => <tr key={`${row.species}-${row.ageGroup}`} className={tableRowClass}>
                <td className="px-4 py-2.5 text-[#b7dbf0]">{speciesLabel(row.species)}</td>
                <td className="px-4 py-2.5">{ageGroupLabel(row.ageGroup)}</td>
                <td className="px-4 py-2.5 font-mono">{row.total}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </Panel>
      )}

      {activeReport === 4 && (
        <Panel title="04 · Recomendações" detail="Animais disponíveis que atendem às preferências do usuário informado">
          <form onSubmit={(event) => void searchRecommendations(event)} className="flex flex-wrap items-end gap-3 border-b border-[#29465b] p-4">
            <label className="block w-48 text-xs font-medium text-[#a9c2d2]">ID do usuário
              <input className={`${fieldClass} mt-1.5`} type="number" min="1" step="1" required value={userId} onChange={(event) => setUserId(event.target.value)} />
            </label>
            <button type="submit" disabled={recommendationStatus === 'loading'} className={primaryButtonClass}>Buscar recomendações</button>
          </form>
          <div aria-live="polite">
            {recommendationStatus === 'loading' && <EmptyState>Carregando recomendações...</EmptyState>}
            {recommendationStatus === 'error' && <div className="p-4"><ErrorMessage message={recommendationError} /></div>}
            {recommendationStatus === 'ready' && (recommended.length === 0
              ? <EmptyState>Nenhum animal corresponde às preferências deste usuário.</EmptyState>
              : <AnimalResults animals={recommended} />)}
          </div>
        </Panel>
      )}
    </div>
  )
}

function AnimalResults({ animals }: { animals: Animal[] }) {
  return (
    <div className="overflow-x-auto"><table className={tableClass}>
      <thead className={tableHeadClass}><tr><th className="px-4 py-2.5">ID</th><th className="px-4 py-2.5">Animal</th><th className="px-4 py-2.5">Espécie</th><th className="px-4 py-2.5">Raça</th><th className="px-4 py-2.5">Centro de adoção</th><th className="px-4 py-2.5">Situação</th></tr></thead>
      <tbody>{animals.map((animal) => <tr key={animal.id} className={tableRowClass}>
        <td className="px-4 py-2.5 font-mono text-xs text-[#819caf]">#{animal.id}</td>
        <td className="px-4 py-2.5 font-medium text-[#b7dbf0]">{animal.name}</td>
        <td className="px-4 py-2.5">{speciesLabel(animal.species)}</td>
        <td className="px-4 py-2.5">{animal.breedName || '—'}</td>
        <td className="px-4 py-2.5">{animal.centerName}<span className="ml-1 font-mono text-xs text-[#819caf]">#{animal.centerId}</span></td>
        <td className="px-4 py-2.5"><Availability available={animal.available} /></td>
      </tr>)}</tbody>
    </table></div>
  )
}
