export const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

export const fmtLKR = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

export const fmtBoth = (usd: number, exchangeRate: number) => `${fmtUSD(usd)} / ${fmtLKR(usd * exchangeRate)}`

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}