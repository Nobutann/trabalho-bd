import { ageGroupLabel, speciesLabel } from '../format'
import type { DashboardData } from '../types'
import { Availability, EmptyState, Panel, tableClass, tableHeadClass, tableRowClass } from '../components/ui'

interface DashboardPageProps {
  data: DashboardData
  onNavigate: (page: 'animals' | 'reports') => void
}

const ageGroups = ['0-1', '2-4', '5+', 'Unknown']

export function DashboardPage({ data, onNavigate }: DashboardPageProps) {
  const total = data.animals.length
  const available = data.animals.filter((animal) => animal.available).length
  const centers = new Set(data.animals.map((animal) => animal.centerId)).size
  const maxSpecies = Math.max(1, ...data.speciesSummary.map((row) => row.total))
  const maxAge = Math.max(1, ...ageGroups.map((group) => data.ageGroupSummary
    .filter((row) => row.ageGroup === group)
    .reduce((sum, row) => sum + row.total, 0)))

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Animais cadastrados" value={total} note="registros no catálogo" />
        <StatCard label="Disponíveis" value={available} note="aptos para adoção" />
        <StatCard label="Raças" value={data.breeds.length} note="opções cadastradas" />
        <StatCard label="Centros" value={centers} note="com animais cadastrados" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Animais por espécie" detail="Consulta de totais e disponibilidade">
          {data.speciesSummary.length === 0 ? <EmptyState>Não há animais cadastrados.</EmptyState> : (
            <div className="space-y-5 p-5">
              {data.speciesSummary.map((row) => (
                <div key={row.species}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-[#dfedf6]">{speciesLabel(row.species)}</span>
                    <span className="font-mono text-[#a8cce2]">{row.total}</span>
                  </div>
                  <div className="flex h-3.5 overflow-hidden bg-[#0a1929]" role="img" aria-label={`${speciesLabel(row.species)}: ${row.available} disponíveis e ${row.unavailable} indisponíveis`}>
                    <span className="bg-[#6daed3]" style={{ width: `${row.available / maxSpecies * 100}%` }} />
                    <span className="bg-[#526a7e]" style={{ width: `${row.unavailable / maxSpecies * 100}%` }} />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-[#8ea9bb]">
                    <span>{row.available} disponíveis</span>
                    <span>{row.unavailable} indisponíveis</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 border-t border-[#29465b] pt-3 text-xs text-[#a5bdcd]">
                <Legend color="bg-[#6daed3]" label="Disponíveis" />
                <Legend color="bg-[#526a7e]" label="Indisponíveis" />
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Faixas etárias" detail="Distribuição dos animais por idade">
          {data.ageGroupSummary.length === 0 ? <EmptyState>Não há dados para o gráfico.</EmptyState> : (
            <div className="space-y-4 p-5">
              {ageGroups.map((group) => {
                const totalInGroup = data.ageGroupSummary
                  .filter((row) => row.ageGroup === group)
                  .reduce((sum, row) => sum + row.total, 0)

                return (
                  <div key={group} className="grid grid-cols-[115px_1fr_30px] items-center gap-3 text-xs sm:grid-cols-[135px_1fr_30px]">
                    <span className="text-[#b7cbd9]">{ageGroupLabel(group)}</span>
                    <div className="h-3.5 bg-[#0a1929]" role="img" aria-label={`${ageGroupLabel(group)}: ${totalInGroup} animais`}>
                      <div className="h-full bg-[#6daed3]" style={{ width: `${totalInGroup / maxAge * 100}%` }} />
                    </div>
                    <span className="text-right font-mono text-[#a8cce2]">{totalInGroup}</span>
                  </div>
                )
              })}
              <p className="border-t border-[#29465b] pt-3 text-xs text-[#8ea9bb]">Idades calculadas pela consulta SQL do backend.</p>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Catálogo de animais"
        detail="Registros recentes com centro e raça associados"
        action={<button type="button" onClick={() => onNavigate('animals')} className="text-xs font-medium text-[#91c9e9] hover:underline">Ver todos →</button>}
      >
        {data.animals.length === 0 ? <EmptyState>Nenhum animal cadastrado.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr><th className="px-4 py-2.5">Animal</th><th className="px-4 py-2.5">Espécie</th><th className="px-4 py-2.5">Raça</th><th className="px-4 py-2.5">Centro</th><th className="px-4 py-2.5">Situação</th></tr>
              </thead>
              <tbody>
                {[...data.animals].reverse().slice(0, 7).map((animal) => (
                  <tr key={animal.id} className={tableRowClass}>
                    <td className="px-4 py-2.5 font-medium text-[#b7dbf0]">{animal.name}<span className="ml-2 font-mono text-xs text-[#7895a8]">#{animal.id}</span></td>
                    <td className="px-4 py-2.5">{speciesLabel(animal.species)}</td>
                    <td className="px-4 py-2.5">{animal.breedName || '—'}</td>
                    <td className="px-4 py-2.5">{animal.centerName}</td>
                    <td className="px-4 py-2.5"><Availability available={animal.available} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-xs text-[#7f9bac]">As tabelas e gráficos mostram dados atuais do MySQL. Veja os resultados completos na seção <button type="button" onClick={() => onNavigate('reports')} className="text-[#91c9e9] hover:underline">Consultas</button>.</p>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="border border-[#2b4961] bg-[#112438] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#9cb9cc]">{label}</p>
      <p className="mt-2 font-mono text-3xl text-[#e7f3fb]">{value}</p>
      <p className="mt-1 text-xs text-[#7f9bac]">{note}</p>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`size-2.5 ${color}`} />{label}</span>
}
