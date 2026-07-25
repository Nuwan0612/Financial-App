import api from "@/lib/api"


// ===============================================================================
//                               SECTORS API
// ===============================================================================


export type Sector = {
  id: number
  name: string
}

export const sectorsApi = {
  getAll: () => api.get<Sector[]>("/sectors"),
  create: (data: { name: string }) => api.post<Sector>("/sectors", data),
  update: (id: number, data: Partial<Sector>) => api.put<Sector>(`/sectors/${id}`, data),
  delete: (id: number) => api.delete(`/sectors/${id}`),
}



// ===============================================================================
//                            INVESTMENT COMPANIES API
// ===============================================================================

// Maps to InvestmentCompanyResponseDTO
export type InvestmentCompany = {
  id: number
  symbol: string
  name: string
  currentPrice: number
  sectorName: string
  isSp20: boolean
  totalActiveShares: number
  totalInvestedAmount: number
  currentTotalValue: number
  totalProfit: number
}

// Maps to InvestmentCompanyRequestDTO
export type InvestmentCompanyRequest = {
  symbol: string;
  name: string;
  isSp20: boolean;
  currentPrice?: number; // Optional because BigDecimal is not marked @NotNull in backend
  sectorId: number;
}

export const investmentCompaniesApi = {
  getAll: () => api.get<InvestmentCompany[]>("/companies"),
  getById: (id: number) => api.get<InvestmentCompany>(`/companies/${id}`),
  create: (data: InvestmentCompanyRequest) => api.post<InvestmentCompany>("/companies", data),
  update: (id: number, data: InvestmentCompanyRequest) => api.put<InvestmentCompany>(`/companies/${id}`, data),
  updatePrice: (id: number, newPrice: number, accountId: number) => api.patch<InvestmentCompany>(`/companies/${id}/price`, { newPrice, accountId }),
}



// ===============================================================================
//                            COMPANY METRICS API
// ===============================================================================

export type CompanyMetric = {
  id: number;
  companyId: number;
  isDividendPaying: boolean;
  peRatio: number;
  eps: number;
}

export const metricsApi = {
  getByCompany: (companyId: number) => api.get<CompanyMetric>(`/metrics/company/${companyId}`),
  update: (companyId: number, data: Partial<CompanyMetric>) => api.put<CompanyMetric>(`/metrics/company/${companyId}`, data)
}


// ===============================================================================
//                                  TRADES API
// ===============================================================================

export type TradeTransaction = {
  id: number;
  companyId: number;
  companySymbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  investmentAmount: number;
  transactionDate: string;
}

export type TradeTransactionRequest = {
  companyId: number;
  type: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  accountId: number;
  bucketId: number;
}

export const tradesApi = {
  getByCompany: (companyId: number) => api.get<TradeTransaction[]>(`/trades/company/${companyId}`),
  create: (data: TradeTransactionRequest) => api.post<TradeTransaction>("/trades", data),
  update: (id: number, data: TradeTransactionRequest) => api.put<TradeTransaction>(`/trades/${id}`, data),
  delete: (id: number) => api.delete(`/trades/${id}`)
}