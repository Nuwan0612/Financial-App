export type CalAssetCategory = "UNIT_TRUST" | "T_BILL" | "BOND"
export type CalTransactionType = "INVEST" | "REDEEM"

export type CalFund = {
  id: number
  name: string
  category: CalAssetCategory
  currentValue: number
  isActive: boolean
  accountId: number
  bucketId: number
  totalInvested: number
  totalProfit: number
}

export type CalTransaction = {
  id: number
  calFundId: number
  fundName: string
  type: CalTransactionType
  amount: number
  transactionDate: string
}


