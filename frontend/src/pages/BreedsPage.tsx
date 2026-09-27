import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { speciesLabel } from '../format'
import type { Breed, BreedInput, Species } from '../types'
import {
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

interface BreedsPageProps {
  breeds: Breed[]
  refresh: () => Promise<void>
}

export function BreedsPage({ breeds, refresh }: BreedsPageProps) {
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [editor, setEditor] = useState<Breed | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editor) {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      editorRef.current?.focus({ preventScroll: true })
    }
  }, [editor, error])

  function openEditor(target: Breed | 'new') {
    setError('')
    setEditor(target)
    if (editor === target) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filteredBreeds = breeds.filter((breed) =>
    breed.name.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
    && (speciesFilter === 'all' || breed.species === speciesFilter),
  )

  async function save(input: BreedInput) {
    setBusy(true)
    setError('')
    try {
      if (editor === 'new') {
        await api.createBreed(input)
      } else if (editor) {
        await api.updateBreed(editor.id, input)
      }
      await refresh()
      setEditor(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a raça.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(breed: Breed) {
    if (!window.confirm(`Excluir a raça ${breed.name}? Os animais associados continuarão cadastrados, sem raça definida.`)) return

    setBusy(true)
    setError('')
    try {
      await api.deleteBreed(breed.id)
      await refresh()
      if (editor !== 'new' && editor?.id === breed.id) setEditor(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir a raça.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      {error && !editor && <ErrorMessage message={error} />}
      {editor && (
        <div ref={editorRef} tabIndex={-1} className="outline-none">
          <Panel title={editor === 'new' ? 'Cadastrar raça' : `Editar ${editor.name}`} detail="Nome e espécie são obrigatórios">
            {error && <div className="px-4 pt-4"><ErrorMessage message={error} /></div>}
            <BreedForm key={editor === 'new' ? 'new' : editor.id} breed={editor === 'new' ? null : editor} busy={busy} onSave={save} onCancel={() => setEditor(null)} />
          </Panel>
        </div>
      )}
      <Panel
        title="Raças cadastradas"
        detail={`${filteredBreeds.length} de ${breeds.length} registros`}
        action={<button type="button" onClick={() => openEditor('new')} className={primaryButtonClass}>+ Nova raça</button>}
      >
        <div className="grid gap-3 border-b border-[#29465b] p-4 md:grid-cols-[1fr_170px]">
          <label className="sr-only" htmlFor="breed-search">Buscar raças</label>
          <input id="breed-search" className={fieldClass} placeholder="Buscar por nome" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="sr-only" htmlFor="breed-species">Filtrar por espécie</label>
          <select id="breed-species" className={fieldClass} value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)}>
            <option value="all">Todas as espécies</option><option value="Cao">Cães</option><option value="Gato">Gatos</option>
          </select>
        </div>
        {filteredBreeds.length === 0 ? <EmptyState>Nenhuma raça corresponde aos filtros.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={tableHeadClass}>
                <tr><th className="px-4 py-2.5">ID</th><th className="px-4 py-2.5">Nome</th><th className="px-4 py-2.5">Espécie</th><th className="px-4 py-2.5 text-right">Ações</th></tr>
              </thead>
              <tbody>
                {filteredBreeds.map((breed) => (
                  <tr key={breed.id} className={tableRowClass}>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#819caf]">#{breed.id}</td>
                    <td className="px-4 py-2.5 font-medium text-[#b7dbf0]">{breed.name}</td>
                    <td className="px-4 py-2.5">{speciesLabel(breed.species)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                      <button type="button" disabled={busy} onClick={() => openEditor(breed)} className="mr-3 text-[#9fd2ef] hover:underline disabled:opacity-50">Editar</button>
                      <button type="button" disabled={busy} onClick={() => void remove(breed)} className="text-[#e6a4aa] hover:underline disabled:opacity-50">Excluir</button>
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

function BreedForm({ breed, busy, onSave, onCancel }: {
  breed: Breed | null
  busy: boolean
  onSave: (input: BreedInput) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(breed?.name || '')
  const [species, setSpecies] = useState<Species>(breed?.species || 'Cao')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSave({ name: name.trim(), species })
  }

  return (
    <form onSubmit={submit} className="space-y-5 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-medium text-[#a9c2d2]">Nome *
          <input className={`${fieldClass} mt-1.5`} value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
        </label>
        <label className="block text-xs font-medium text-[#a9c2d2]">Espécie *
          <select className={`${fieldClass} mt-1.5`} value={species} onChange={(event) => setSpecies(event.target.value as Species)}>
            <option value="Cao">Cão</option><option value="Gato">Gato</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-[#29465b] pt-4">
        <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Salvando...' : 'Salvar raça'}</button>
        <button type="button" disabled={busy} onClick={onCancel} className={secondaryButtonClass}>Cancelar</button>
      </div>
    </form>
  )
}
