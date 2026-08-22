export const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })
