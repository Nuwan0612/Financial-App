import { 
  LayoutDashboard,
  ScrollText, ArrowLeftRight,
  Landmark, TrendingUp, Briefcase,
  PieChart, Calculator,
  BookOpen,
  Settings,
  Wallet
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Daily Logs", url: "/daily-logs", icon: ScrollText },
      { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Finances",
    items: [
    { title: "Finances", url: "/finances", icon: Wallet },  // ← one item
  ],
  },
  {
    label: "Accounts & Assets",
    items: [
      {
        title: "Bank Accounts", url: "/banks", icon: Landmark,
        // subItems: [
        //   { title: "NSB", url: "/banks/nsb" },
        //   { title: "COMB", url: "/banks/comb" },
        // ]
      },
      {
        title: "Investments", url: "/investments", icon: TrendingUp,
        // subItems: [
        //   { title: "CAL", url: "/investments/cal" },
        //   { title: "Binance", url: "/investments/binance" },
        //   { title: "Stock Portfolio", url: "/investments/stocks" },
        // ]
      },
      { title: "Assets", url: "/assets", icon: Briefcase },
    ],
  },
  {
    label: "Planning",
    items: [
      { title: "Allocations", url: "/allocations", icon: PieChart },
      { title: "Calculator", url: "/calculator", icon: Calculator },
    ],
  },
  {
    label: "Journal",
    items: [
      { title: "Notes & Ideas", url: "/journal", icon: BookOpen },
    ],
  },
  // {
  //   label: "Settings",
  //   items: [
  //     { title: "Categories", url: "/settings/categories", icon: Settings },
  //   ],
  // },
];