import api from "@/lib/api"
import { get } from "http"

export type Account = {
  id: number
  name: string
  type: string
  currentBalance: number
  isActive: boolean
}

export type AccountDto = {
  name: string
  type: string
  currentBalance: number
}

export const accountsApi = {
  getAll: () => api.get<Account[]>("/accounts"),
  create: (data: AccountDto) => api.post<Account>("/accounts", data),
  update: (id: number, data: Partial<AccountDto>) => api.put<Account>(`/accounts/${id}`, data),
}


export type Bukets = {
  id: number
  name: string
  currentAmount: number
  cumulativeAmount: number
  subCategoryId: number
  subCategoryName: string
  accountId: number
  accountName: string
  isActive: boolean
}

export const bucketsApi = {
  getBucketsByAccount: (accountId: number) => api.get<Bukets[]>(`/buckets/account/${accountId}`),
  getAll: () => api.get<Bukets[]>("/buckets"),
}



export type Snapshots = {
  id: number
  accountId: number
  balance: number
  date: string
}

export const snapshotsApi = {
  getSnapshotsByAccount: (accountId: number) => api.get<Snapshots[]>(`/accounts/snapshots/${accountId}`),
}