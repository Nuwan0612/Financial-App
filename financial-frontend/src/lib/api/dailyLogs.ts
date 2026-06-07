import api from "@/lib/api"


export type DailyLog = {
  id: number
  date: string
  description: string
  amount: number
  type: "INCOME" | "EXPENSE"
  accountId: number
  accountName: string
  bucketId: number | null
  bucketName: string | null
}

export type DailyLogDto = {
  date: string
  description: string
  amount: number
  type: "INCOME" | "EXPENSE"
  accountId: number
  bucketId: number | null
}

export const dailyLogApi = {
  getAll: () => api.get<DailyLog[]>("/daily-logs"),
  create: (data: DailyLogDto) => api.post<DailyLog>("/daily-logs", data),
  createBulk: (data: DailyLogDto[]) => api.post<DailyLog[]>("/daily-logs/bulk", data),
  delete: (id: number) => api.delete(`/daily-logs/${id}`),
}