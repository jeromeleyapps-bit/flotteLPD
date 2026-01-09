export const departments = [
  { id: 1, name: 'Alpes-de-Haute-Provence', region: 'PACA' },
  { id: 2, name: 'Hautes-Alpes', region: 'PACA' },
  { id: 3, name: 'Alpes-Maritimes', region: 'PACA' },
  { id: 4, name: 'Bouches-du-Rhône', region: 'PACA' },
  { id: 5, name: 'Var', region: 'PACA' },
  { id: 6, name: 'Vaucluse', region: 'PACA' }
]

export function getDepartmentById(id) {
  return departments.find(d => d.id === id)
}

export function getDepartmentsByRegion(region) {
  return departments.filter(d => d.region === region)
}