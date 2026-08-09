import { CalFund, CalTransaction } from "./types"

export const funds: CalFund[] = [
  { id: 1, name: "FIOF", category: "UNIT_TRUST", currentValue: 125000, isActive: true, totalInvested: 100000, totalProfit: 25000 },
  { id: 2, name: "NAMAL Growth", category: "UNIT_TRUST", currentValue: 88000, isActive: true, totalInvested: 80000, totalProfit: 8000 },
  { id: 3, name: "Ceybank Unit Trust", category: "UNIT_TRUST", currentValue: 52000, isActive: true, totalInvested: 50000, totalProfit: 2000 },
  { id: 4, name: "91-Day T-Bill", category: "T_BILL", currentValue: 210000, isActive: true, totalInvested: 200000, totalProfit: 10000 },
  { id: 5, name: "182-Day T-Bill", category: "T_BILL", currentValue: 155000, isActive: true, totalInvested: 150000, totalProfit: 5000 },
  { id: 6, name: "2-Year Treasury Bond", category: "BOND", currentValue: 320000, isActive: true, totalInvested: 300000, totalProfit: 20000 },
  { id: 7, name: "5-Year Treasury Bond", category: "BOND", currentValue: 265000, isActive: true, totalInvested: 250000, totalProfit: 15000 },
]

export const transactions: CalTransaction[] = [
  { id: 1, calFundId: 1, fundName: "FIOF", type: "INVEST", amount: 50000, transactionDate: "2024-01-15T10:30:00" },
  { id: 2, calFundId: 1, fundName: "FIOF", type: "INVEST", amount: 50000, transactionDate: "2024-03-20T14:00:00" },
  { id: 3, calFundId: 1, fundName: "FIOF", type: "REDEEM", amount: 10000, transactionDate: "2024-06-10T09:15:00" },
  { id: 4, calFundId: 2, fundName: "NAMAL Growth", type: "INVEST", amount: 80000, transactionDate: "2024-02-01T11:00:00" },
  { id: 5, calFundId: 3, fundName: "Ceybank Unit Trust", type: "INVEST", amount: 50000, transactionDate: "2024-04-05T13:00:00" },
  { id: 6, calFundId: 4, fundName: "91-Day T-Bill", type: "INVEST", amount: 200000, transactionDate: "2024-01-10T09:00:00" },
  { id: 7, calFundId: 5, fundName: "182-Day T-Bill", type: "INVEST", amount: 150000, transactionDate: "2024-03-01T10:00:00" },
  { id: 8, calFundId: 6, fundName: "2-Year Treasury Bond", type: "INVEST", amount: 300000, transactionDate: "2023-12-01T09:00:00" },
  { id: 9, calFundId: 7, fundName: "5-Year Treasury Bond", type: "INVEST", amount: 250000, transactionDate: "2023-10-01T09:00:00" },
]

export const growthHistory = [
  { date: "Jan", value: 800000 },
  { date: "Feb", value: 850000 },
  { date: "Mar", value: 920000 },
  { date: "Apr", value: 890000 },
  { date: "May", value: 960000 },
  { date: "Jun", value: 1010000 },
  { date: "Jul", value: 1050000 },
  { date: "Aug", value: 1080000 },
  { date: "Sep", value: 1100000 },
  { date: "Oct", value: 1150000 },
  { date: "Nov", value: 1180000 },
  { date: "Dec", value: 1215000 },
]

export const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981"]