export type PublicationFormat =
  | 'Digital'
  | 'Impreso'
  | 'Audiolibro'
  | 'Digital e impreso'
  | 'Digital y audiolibro'
  | 'Digital, impreso y audiolibro'

export type PublicationArea =
  | 'agropecuarias'
  | 'salud'
  | 'naturales'
  | 'sociales'
  | 'educacion'
  | 'ingenieria'

export type PublicationLanguage = 'es' | 'en' | 'fr' | 'EspNah' | 'IngEsp'

export type PublicationStatus = 'published' | 'draft' | 'archived'

export interface Publication {
  id: string
  title: string
  authors: string
  doi: string
  isbn?: string
  description: string
  format: PublicationFormat
  area: PublicationArea
  language: PublicationLanguage
  imageUrl: string
  publisher: string
  publicationDate: string
  pages?: number
  keywords?: string
  status: PublicationStatus
  featured: boolean
  views: number
  downloads: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export const AREAS: Array<{ value: PublicationArea; label: string }> = [
  { value: 'agropecuarias', label: 'Ciencias agropecuarias' },
  { value: 'salud', label: 'Ciencias de la salud' },
  { value: 'naturales', label: 'Ciencias naturales y exactas' },
  { value: 'sociales', label: 'Ciencias sociales y administrativas' },
  { value: 'educacion', label: 'Educacion y humanidades' },
  { value: 'ingenieria', label: 'Ingenieria y tecnologia' },
]

export const FORMATS: Array<{ value: PublicationFormat; label: string }> = [
  { value: 'Digital', label: 'Digital' },
  { value: 'Impreso', label: 'Impreso' },
  { value: 'Audiolibro', label: 'Audiolibro' },
  { value: 'Digital e impreso', label: 'Digital e impreso' },
  { value: 'Digital y audiolibro', label: 'Digital y audiolibro' },
  {
    value: 'Digital, impreso y audiolibro',
    label: 'Digital, impreso y audiolibro',
  },
]

export const LANGUAGES: Array<{ value: PublicationLanguage; label: string }> = [
  { value: 'es', label: 'Espanol' },
  { value: 'en', label: 'Ingles' },
  { value: 'fr', label: 'Frances' },
  { value: 'EspNah', label: 'Espanol y nahuatl' },
  { value: 'IngEsp', label: 'Ingles y espanol' },
]

export const PUBLICATION_STATUS_OPTIONS: Array<{
  value: PublicationStatus
  label: string
}> = [
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Borrador' },
  { value: 'archived', label: 'Archivado' },
]

export const generatePublicationId = (): string => {
  return `pub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export const validatePublication = (
  publication: Partial<Publication>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!publication.title?.trim()) {
    errors.push('El titulo es requerido')
  }
  if (!publication.authors?.trim()) {
    errors.push('Los autores son requeridos')
  }
  if (!publication.description?.trim()) {
    errors.push('La descripcion es requerida')
  }
  if (!publication.doi?.trim()) {
    errors.push('El DOI es requerido')
  }
  if (!publication.format) {
    errors.push('El formato es requerido')
  }
  if (!publication.area) {
    errors.push('El area es requerida')
  }
  if (!publication.language) {
    errors.push('El idioma es requerido')
  }
  if (!publication.imageUrl?.trim()) {
    errors.push('La portada es requerida')
  }
  if (!publication.publicationDate) {
    errors.push('La fecha de publicacion es requerida')
  }
  if (!publication.status) {
    errors.push('El estatus es requerido')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const createEmptyPublication = (userId: string): Partial<Publication> => {
  const now = new Date().toISOString()

  return {
    id: generatePublicationId(),
    title: '',
    authors: '',
    doi: '',
    isbn: '',
    description: '',
    format: 'Digital',
    area: 'educacion',
    language: 'es',
    imageUrl: '',
    publisher: 'Direccion General de Publicaciones',
    publicationDate: new Date().toISOString().split('T')[0],
    pages: undefined,
    keywords: '',
    status: 'draft',
    featured: false,
    views: 0,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  }
}
