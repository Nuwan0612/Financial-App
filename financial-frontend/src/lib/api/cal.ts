import api from "@/lib/api"

export type CalAssetCategory = "UNIT_TRUST" | "T_BILL" | "BOND"

export interface CalFundRequestDTO {
  name: string
  category: CalAssetCategory
  accountId: number
  bucketId: number
}

// Update this interface based on your actual backend response DTO
export interface CalFundResponseDTO {
  id: number
  name: string
  category: CalAssetCategory
  accountId: number
  bucketId: number
}

export const calFundsApi = {
  create: (data: CalFundRequestDTO) => api.post<CalFundResponseDTO>("/cal-funds", data),
  getAll: () => api.get<CalFundResponseDTO[]>("/cal-funds"),
}
