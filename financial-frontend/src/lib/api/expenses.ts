import api from "@/lib/api"

export type Expense = {
  id: number
  name: string
  amount: number
}

export type CreateExpenseDto = {
  name: string
  amount: number
}

export const expensesApi = {
  getAll: () => api.get<Expense[]>("/expenses"),
  create: (data: CreateExpenseDto) => api.post<Expense>("/expenses", data),
  update: (id: number, data: Partial<CreateExpenseDto>) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
}