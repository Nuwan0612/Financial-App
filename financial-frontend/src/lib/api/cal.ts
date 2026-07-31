import api from "@/lib/api"

type CalAssetCategory = "UNIT_TRUST" | "T_BILL" | "BOND"
type CalTransactionType = "INVEST" | "REDEEM"

type CalFund = {
  id: number
  name: string
  category: CalAssetCategory
  currentValue: number
  isActive: boolean
  totalInvested: number
  totalProfit: number
}

type CalTransaction = {
  id: number
  calFundId: number
  fundName: string
  type: CalTransactionType
  amount: number
  transactionDate: string
}

