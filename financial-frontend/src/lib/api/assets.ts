import api from "@/lib/api"

export type Assets = {
  id: number
  name: string
  purchasePrice: number
  currentMarketValue: number
  accrueDate: string
}

export type AssetsDto = {
  name: string
  purchasePrice: number
  accrueDate: string
  currentMarketValue: number
}


export const assetsApi = {
  getAll: () => api.get<Assets[]>("/assets"),
  create: (data: AssetsDto) => api.post<Assets>("/assets", data),
  update: (id: number, data: Partial<AssetsDto>) => api.put<Assets>(`/assets/${id}`, data),
  delete: (id: number) => api.delete(`/assets/${id}`),
}
