import api from "@/lib/api"

export type CalAssetCategory = "UNIT_TRUST" | "T_BILL" | "BOND"
export type CalTransactionType = "INVEST" | "REDEEM"

export interface CalFundRequestDTO {
  name: string
  category: CalAssetCategory
  accountId: number
  bucketId: number
}

export interface CalFundResponseDTO {
  id: number
  name: string
  category: CalAssetCategory
  currentValue: number
  isActive: boolean
  accountId: number
  bucketId: number
  totalInvested: number
  totalProfit: number
}

export const calFundsApi = {
  getAll: () => api.get<CalFundResponseDTO[]>("/cal-funds"),
  getById: (id: number) => api.get<CalFundResponseDTO>(`/cal-funds/${id}`),
  create: (data: CalFundRequestDTO) => api.post<CalFundResponseDTO>("/cal-funds", data),
  updateValue: (id: number, newValue: number) => api.patch<CalFundResponseDTO>(`/cal-funds/${id}/value`, { newValue }),
}


export type CalTransactionRequestDTO = {
  calFundId: number
  type: CalTransactionType
  amount: number
}

export type CalTransactionResponseDTO = {
  id: number
  calFundId: number
  fundName: string
  type: CalTransactionType
  amount: number
  transactionDate: string
}

export const calTransactionsApi = {
  create: (data: CalTransactionRequestDTO) => api.post<CalTransactionResponseDTO>("/cal-transactions", data),
  getByFund: (fundId: number) => api.get<CalTransactionResponseDTO[]>(`/cal-transactions/fund/${fundId}`),
}