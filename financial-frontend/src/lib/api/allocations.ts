import api from "@/lib/api"

export type MainCategory = {
  id: number
  name: string
}

export type MainCategoryDto = {
  name: string
}


export const mainCategoryApi = {
  getAll: () => api.get<MainCategory[]>("/mainCategories"),
  create: (data: MainCategoryDto) => api.post<MainCategory>("/mainCategories", data),
  update: (id: number, data: Partial<MainCategoryDto>) => api.put<MainCategory>(`/mainCategories/${id}`, data),
  delete: (id: number) => api.delete(`/mainCategories/${id}`),
}

export type SubCategory = {
  id: number
  name: string
  percentage: number
  mainCategoryId: number
  mainCategoryName: string
  accountId: number
  accountName: string
}

export type SubCategoryDto = {
  name: string
  percentage: number
  mainCategoryId: number
  accountId: number
}


export type ConflictBucket = {
  id: number
  name: string
  balance: number
}

export type DestinationBucket = {
  bucketId: number
  bucketName: string
  subCategoryName: string
}

export type DestinationAccount = {
  accountId: number
  accountName: string
  buckets: DestinationBucket[]
}

export type ResolutionData = {
  accountId: number
  accountName: string
  mainCategoryId: number
  mainCategoryName: string
  subCategoryId: number
  subCategoryName: string
  conflictingBuckets: ConflictBucket[]
  availableDestinations: DestinationAccount[]
}

export type ConflictResponse = {
  resolutionData: ResolutionData
  error: string
  message: string
  status: number
}

export const subCategoryApi = {
  getAll: () => api.get<SubCategory[]>("/subCategories"),
  create: (data: SubCategoryDto) => api.post<SubCategory>("/subCategories", data),
  update: (id: number, data: Partial<SubCategoryDto>) => api.put<SubCategory>(`/subCategories/${id}`, data),
  delete: (id: number) => api.delete(`/subCategories/${id}`),
}

// src/lib/api/transactions.ts
export type TransactionDto = {
  description: string
  amount: number
  openingDate: string
  fromAccountId?: number | null
  fromBucketId?: number | null
  toAccountId: number
  toBucketId: number 
}

export type Transaction = {
  id: number
  description: string
  amount: number
  status: boolean
  openingDate: string
  closingDate: string | null
  fromAccountId: number | null
  fromAccountName: string | null
  fromBucketId: number | null
  fromBucketName: string | null
  toAccountId: number
  toAccountName: string
  toBucketId: number
  toBucketName: string
}

export const transactionApi = {
  getAll: () => api.get<Transaction[]>("/transactions"),
  createBulk: (data: TransactionDto[]) => api.post<Transaction[]>("/transactions/bulk", data),
  transfer: (data: TransactionDto) => api.post<Transaction>("/transactions/transfer", data),
  markSuccess: (id: number) => api.put(`/transactions/${id}/success`),
  bulkTransfer: (data: TransactionDto[]) => api.post("/transactions/bulk-transfer", data)
}




// src/lib/api/allocations.ts
export type MainCategoryConflictBucket = {
  bucketId: number
  bucketName: string
  balance: number
  subCategoryId: number
  subCategoryName: string
  accountId: number
  accountName: string
}

export type MainCategoryConflictResponse = {
  resolutionData: {
    mainCategoryId: number
    mainCategoryName: string
    conflictingBuckets: MainCategoryConflictBucket[]
    availableDestinations: DestinationAccount[]
  }
  error: string
  message: string
  status: number
}
