import api from "@/lib/api"

export type LiabilityPayment = {
  id: number
  amountPaid: number
  paymentDate: string
  notes: string
}


export type CreateLiabilityPaymentDto = {
  amountPaid: number
  paymentDate: string
  notes: string
}

export type Liability = {
  id: number
  name: string
  isPaid: number
  completed: string
  borrowed: string
  amount: number
  totalPaid: number
  remainingBalance: number
  payments: LiabilityPayment[]
}

export type CreateLiabilityDto = {
  name: string
  isPaid: boolean
  completed: string
  borrowed: string
  amount: number
}

export const liabilitiesApi = {
  getAll: () => api.get<Liability[]>("/liabilities"),
  getById: (id: number) => api.get<Liability>(`/liabilities/${id}`),
  create: (data: CreateLiabilityDto) => api.post<Liability>("/liabilities", data),
  update: (id: number, data: Partial<CreateLiabilityDto>) => api.put<Liability>(`/liabilities/${id}`, data),
  delete: (id: number) => api.delete(`/liabilities/${id}`),
}

export const liabilityPaymentsApi = {
  create: (liabilityId: number, data: CreateLiabilityPaymentDto) => api.post<Liability>(`/liabilities/${liabilityId}/payments`, data),
  delete: (liabilityId: number, paymentId: number) => api.delete<Liability>(`/liabilities/${liabilityId}/payments/${paymentId}`),
}