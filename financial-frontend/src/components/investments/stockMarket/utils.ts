// src/components/investments/utils.ts

export const SECTOR_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { 
    style: "currency", 
    currency: "LKR", 
    maximumFractionDigits: 0 
  }).format(n)

export const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-LK", { 
    maximumFractionDigits: 2 
  }).format(n)

