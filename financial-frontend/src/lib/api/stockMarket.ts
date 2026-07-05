import api from "@/lib/api"


export type Sector = {
  id: number
  name: string
}

export const sectorsApi = {
  getAll: () => api.get<Sector[]>("/api/v1/sectors"),
  create: (data: { name: string }) => api.post<Sector>("/api/v1/sectors", data),
  update: (id: number, data: Partial<Sector>) => api.put<Sector>(`/api/v1/sectors/${id}`, data),
  delete: (id: number) => api.delete(`/api/v1/sectors/${id}`),
}