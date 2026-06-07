import api from "@/lib/api"
import { get } from "http"

export type Currency = "USD" | "LKR"

export type IncomeEntry ={
  id: number
  amount: number
  date: string
  note: string
}

export type IncomeEntryDto = {
  incomeId: number
  date: string
  amount: number
  note: string
}


export type Income = {
  id: number
  name: string
  expectedAmount: number
  currency: Currency
  incomeEntries: IncomeEntry[]
}

export type CreateIncomeDto = {
  name: string
  expectedAmount: number
  currency: Currency
}

export const incomesApi = {
  getAll: () => api.get<Income[]>("/incomes"),
  getById: (id: number) => api.get<Income>(`/incomes/${id}`),
  create: (data: CreateIncomeDto) => api.post<Income>("/incomes", data),
  update: (id: number, data: Partial<CreateIncomeDto>) => api.put<Income>(`/incomes/${id}`, data),
  delete: (id: number) => api.delete(`/incomes/${id}`),
}


// add to src/lib/api/incomes.ts
export const incomeEntryApi = {
  create: (data: IncomeEntryDto) => api.post<IncomeEntry>("/income-entries", data),
  update: (id: number, data: Partial<IncomeEntryDto>) => api.put<IncomeEntry>(`/income-entries/${id}`, data),
  delete: (id: number) => api.delete(`/income-entries/${id}`),
}