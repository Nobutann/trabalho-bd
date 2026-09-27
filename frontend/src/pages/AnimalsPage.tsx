import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { dateLabel, sexLabel, sizeLabel, speciesLabel } from '../format'
import type { Animal, AnimalInput, Breed, Species } from '../types'
import {
  Availability,
  EmptyState,
  ErrorMessage,
  Panel,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableClass,
  tableHeadClass,
  tableRowClass,
} from '../components/ui'

interface AnimalsPageProps {
  animals: Animal[]
  breeds: Breed[]
  refresh: () => Promise<void>
}

interface AnimalDraft {
  name: string
  species: Species
  birthDate: string
  sex: string
  size: string
  color: string
  description: string
  available: boolean
  centerId: string
  breedId: string
}

function draftFromAnimal(animal: Animal | null): AnimalDraft {
  return {
    name: animal?.name || '',
    species: animal?.species || 'Cao',
    birthDate: animal?.birthDate || '',
    sex: animal?.sex || '',
    size: animal?.size || '',
    color: animal?.color || '',
    description: animal?.description || '',
    available: animal?.available ?? true,
    centerId: animal?.centerId.toString() || '',
    breedId: animal?.breedId?.toString() || '',
  }
}

export function AnimalsPage({ animals, breeds, refresh }: AnimalsPageProps) {
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [editor, setEditor] = useState<Animal | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editor) {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      editorRef.current?.focus({ preventScroll: true })
    }
  }, [editor, error])

  function openEditor(target: Animal | 'new') {
    setError('')
    setEditor(target)
    if (editor === target) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const centers = [...new Map(animals.map((animal) => [animal.centerId, animal.centerName])).entries()]
    .sort(([a], [b]) => a - b)
  const filteredAnimals = animals.filter((animal) => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    const matchesSearch = !term || [animal.name, animal.breedName, animal.centerName, String(animal.id)]
      .some((value) => value?.toLocaleLowerCase('pt-BR').includes(term))
    return matchesSearch
      && (speciesFilter === 'all' || animal.species === speciesFilter)
      && (availabilityFilter === 'all' || String(animal.available) === availabilityFilter)
  })

  async function save(input: AnimalInput) {
    setBusy(true)
    setError('')
    try {
      if (editor === 'new') {
        await api.createAnimal(input)
      } else if (editor) {
        await api.updateAnimal(editor.id, input)
      }
      await refresh()
      setEditor(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o animal.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(animal: Animal) {
    if (!window.confirm(`Excluir ${animal.name}? Esta ação também remove as fotos e os registros de interesse associados.`)) return

    setBusy(true)
    setError('')
    try {
      await api.deleteAnimal(animal.id)
      await refresh()
      if (editor !== 'new' && editor?.id === animal.id) setEditor(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o animal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      {error && !editor && <ErrorMessage message={error} />}
      {editor && (
        <div ref={editorRef} tabIndex={-1} className="outline-none">
          <Panel title={editor === 'new' ? 'Cadastrar animal' : `Editar ${editor.name}`} detail="Campos marcados com * são obrigatórios">
            {error && <div className="px-4 pt-4"><ErrorMessage message={error} /></div>}
            <AnimalForm
              key={editor === 'new' ? 'new' : editor.id}
              animal={editor === 'new' ? null : editor}
              breeds={breeds}
              centers={centers}
              busy={busy}
              onCancel={() => setEditor(null)}
              onSave={save}
            />
          </Panel>
        </div>
      )}
      <Panel
        title="Animais cadastrados"
        detail={`${filteredAnimals.length} de ${animals.length} registros`}
        action={<button type="button" onClick={() => openEditor('new')} className={primaryButtonClass}>+ Novo animal</button>}
      >
        <div className="grid gap-3 border-b border-[#29465b] p-4 md:grid-cols-[1fr_150px_170px]">
          <label className="sr-only" htmlFor="animal-search">Buscar animais</label>
          <input id="animal-search" className={fieldClass} placeholder="Buscar por nome, raça, centro ou ID" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="sr-only" htmlFor="animal-species">Filtrar por espécie</label>
          <select id="animal-species" className={fieldClass} value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)}>
            <option value="all">Todas as espécies</option>
            <option value="Cao">Cães</option>
            <option value="Gato">Gatos</option>
          </select>
          <label className="sr-only" htmlFor="animal-availability">Filtrar por situação</label>
          <select id="animal-availability" className={fieldClass} value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
            <option value="all">Todas as situações</option>
            <option value="true">Disponíveis</option>
            <option value="false">Indisponíveis</option>
          </select>
        </div>
        {filteredAnimals.length === 0 ? <EmptyState>Nenhum animal corresponde aos filtros.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr><th className="px-4 py-2.5">Animal</th><th className="px-4 py-2.5">Espécie / raça</th><th className="px-4 py-2.5">Características</th><th className="px-4 py-2.5">Centro</th><th className="px-4 py-2.5">Situação</th><th className="px-4 py-2.5 text-right">Ações</th></tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className={tableRowClass}>
                    <td className="px-4 py-2.5"><span className="font-medium text-[#b7dbf0]">{animal.name}</span><span className="ml-2 font-mono text-xs text-[#7895a8]">#{animal.id}</span></td>
                    <td className="px-4 py-2.5">{speciesLabel(animal.species)}<div className="text-xs text-[#819caf]">{animal.breedName || 'Raça não informada'}</div></td>
                    <td className="px-4 py-2.5">{sexLabel(animal.sex)} · {sizeLabel(animal.size)}<div className="text-xs text-[#819caf]">Nasc.: {dateLabel(animal.birthDate)}</div></td>
                    <td className="px-4 py-2.5">{animal.centerName}<div className="font-mono text-xs text-[#819caf]">#{animal.centerId}</div></td>
                    <td className="px-4 py-2.5"><Availability available={animal.available} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                      <button type="button" disabled={busy} onClick={() => openEditor(animal)} className="mr-3 text-[#9fd2ef] hover:underline disabled:opacity-50">Editar</button>
                      <button type="button" disabled={busy} onClick={() => void remove(animal)} className="text-[#e6a4aa] hover:underline disabled:opacity-50">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

    </div>
  )
}

function AnimalForm({ animal, breeds, centers, busy, onCancel, onSave }: {
  animal: Animal | null
  breeds: Breed[]
  centers: [number, string][]
  busy: boolean
  onCancel: () => void
  onSave: (input: AnimalInput) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => draftFromAnimal(animal))
  const matchingBreeds = breeds.filter((breed) => breed.species === draft.species)

  function update<Key extends keyof AnimalDraft>(key: Key, value: AnimalDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input: AnimalInput = {
      name: draft.name.trim(),
      species: draft.species,
      birthDate: draft.birthDate || null,
      sex: draft.sex ? draft.sex as Animal['sex'] : null,
      size: draft.size ? draft.size as Animal['size'] : null,
      color: draft.color.trim() || null,
      description: draft.description.trim() || null,
      available: draft.available,
      centerId: Number(draft.centerId),
      breedId: draft.breedId ? Number(draft.breedId) : null,
    }
    void onSave(input)
  }

  return (
    <form onSubmit={submit} className="space-y-5 p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block text-xs font-medium text-[#a9c2d2]">Nome *
          <input className={`${fieldClass} mt-1.5`} value={draft.name} onChange={(event) => update('name', event.target.value)} maxLength={100} required />
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Espécie *
          <select className={`${fieldClass} mt-1.5`} value={draft.species} onChange={(event) => setDraft((current) => ({ ...current, species: event.target.value as Species, breedId: '' }))}>
            <option value="Cao">Cão</option><option value="Gato">Gato</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Raça
          <select className={`${fieldClass} mt-1.5`} value={draft.breedId} onChange={(event) => update('breedId', event.target.value)}>
            <option value="">Não informada</option>
            {matchingBreeds.map((breed) => <option key={breed.id} value={breed.id}>{breed.name}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">ID do centro de adoção *
          <input className={`${fieldClass} mt-1.5`} type="number" min="1" step="1" list="known-centers" value={draft.centerId} onChange={(event) => update('centerId', event.target.value)} required />
          <datalist id="known-centers">{centers.map(([id, name]) => <option key={id} value={id} label={name} />)}</datalist>
          <span className="mt-1 block text-[11px] font-normal text-[#819caf]">Informe o ID de um centro existente. Sugestões são obtidas dos animais cadastrados.</span>
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Data de nascimento
          <input className={`${fieldClass} mt-1.5`} type="date" max={new Date().toISOString().slice(0, 10)} value={draft.birthDate} onChange={(event) => update('birthDate', event.target.value)} />
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Sexo
          <select className={`${fieldClass} mt-1.5`} value={draft.sex} onChange={(event) => update('sex', event.target.value)}>
            <option value="">Não informado</option><option value="Macho">Macho</option><option value="Femea">Fêmea</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Porte
          <select className={`${fieldClass} mt-1.5`} value={draft.size} onChange={(event) => update('size', event.target.value)}>
            <option value="">Não informado</option><option value="Pequeno">Pequeno</option><option value="Medio">Médio</option><option value="Grande">Grande</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Cor
          <input className={`${fieldClass} mt-1.5`} value={draft.color} onChange={(event) => update('color', event.target.value)} maxLength={50} />
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Situação *
          <select className={`${fieldClass} mt-1.5`} value={String(draft.available)} onChange={(event) => update('available', event.target.value === 'true')}>
            <option value="true">Disponível</option><option value="false">Indisponível</option>
          </select>
        </label>
      </div>
      <label className="block text-xs font-medium text-[#a9c2d2]">Descrição
        <textarea className={`${fieldClass} mt-1.5 min-h-24 resize-y`} value={draft.description} onChange={(event) => update('description', event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2 border-t border-[#29465b] pt-4">
        <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Salvando...' : 'Salvar animal'}</button>
        <button type="button" disabled={busy} onClick={onCancel} className={secondaryButtonClass}>Cancelar</button>
      </div>
    </form>
  )
}
