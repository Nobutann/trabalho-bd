export type Species = 'Cao' | 'Gato'

export interface Animal {
  id: number
  name: string
  species: Species
  birthDate: string | null
  sex: 'Macho' | 'Femea' | null
  size: 'Pequeno' | 'Medio' | 'Grande' | null
  color: string | null
  description: string | null
  available: boolean
  centerId: number
  centerName: string
  breedId: number | null
  breedName: string | null
}

export interface AnimalInput {
  name: string
  species: Species
  birthDate: string | null
  sex: Animal['sex']
  size: Animal['size']
  color: string | null
  description: string | null
  available: boolean
  centerId: number
  breedId: number | null
}

export interface Breed {
  id: number
  name: string
  species: Species
}

export type BreedInput = Pick<Breed, 'name' | 'species'>

export interface SpeciesSummary {
  species: Species
  total: number
  available: number
  unavailable: number
}

export interface AgeGroupSummary {
  species: Species
  ageGroup: string
  total: number
}

export interface DashboardData {
  animals: Animal[]
  breeds: Breed[]
  speciesSummary: SpeciesSummary[]
  ageGroupSummary: AgeGroupSummary[]
}
