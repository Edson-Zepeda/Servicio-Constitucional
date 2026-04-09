import { useCallback, useEffect, useState } from 'react'
import { Publication } from '../types/Publication'
import { apiPublications } from '../services/api'

export const usePublications = () => {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPublications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiPublications.getAllPublications()
      setPublications(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'No fue posible cargar las publicaciones.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPublications()
  }, [loadPublications])

  const addPublication = useCallback(
    async (publication: Partial<Publication>, actorAccount: string) => {
      const createdPublication = await apiPublications.createPublication(
        publication,
        actorAccount
      )
      setPublications((prev) => [createdPublication, ...prev])
      return createdPublication
    },
    []
  )

  const updatePublication = useCallback(
    async (id: string, updates: Partial<Publication>, actorAccount: string) => {
      const updatedPublication = await apiPublications.updatePublication(
        id,
        updates,
        actorAccount
      )
      setPublications((prev) =>
        prev.map((publication) =>
          publication.id === id ? updatedPublication : publication
        )
      )
      return updatedPublication
    },
    []
  )

  const deletePublication = useCallback(async (id: string, actorAccount: string) => {
    await apiPublications.deletePublication(id, actorAccount)
    setPublications((prev) => prev.filter((publication) => publication.id !== id))
  }, [])

  const recordView = useCallback(async (id: string) => {
    const updatedPublication = await apiPublications.recordView(id)
    if (updatedPublication) {
      setPublications((prev) =>
        prev.map((publication) =>
          publication.id === id ? updatedPublication : publication
        )
      )
    }
    return updatedPublication
  }, [])

  const recordDownload = useCallback(async (id: string) => {
    const updatedPublication = await apiPublications.recordDownload(id)
    if (updatedPublication) {
      setPublications((prev) =>
        prev.map((publication) =>
          publication.id === id ? updatedPublication : publication
        )
      )
    }
    return updatedPublication
  }, [])

  const getPublication = useCallback(
    (id: string) => publications.find((publication) => publication.id === id),
    [publications]
  )

  return {
    publications,
    loading,
    error,
    addPublication,
    updatePublication,
    deletePublication,
    getPublication,
    recordView,
    recordDownload,
    refreshPublications: loadPublications,
  }
}
