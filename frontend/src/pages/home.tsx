import {
  Hexagon,
  ShoppingBag,
  PackagePlus,
  UserRoundPlus,
} from "lucide-react";
import { getStoredUser } from "../utils/authStorage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const salesStats = [
  {
    label: "Total Sales",
    value: "$5k",
    change: "+10% from yesterday",
    color: "#ffb547",
    icon: Hexagon,
  },
  {
    label: "Total Order",
    value: "500",
    change: "+8% from yesterday",
    color: "#a5e0d9",
    icon: ShoppingBag,
  },
  {
    label: "Product Sold",
    value: "9",
    change: "+2% from yesterday",
    color: "#e8b6e4",
    icon: PackagePlus,
  },
  {
    label: "New Customer",
    value: "12",
    change: "+3% from yesterday",
    color: "#29b9f5",
    icon: UserRoundPlus,
  },
];

const products = [
  { name: "Home Decore Range", popularity: 78, sales: "46%", color: "#ffb547" },
  { name: "Disney Princess Dress", popularity: 62, sales: "17%", color: "#a5e0d9" },
  { name: "Bathroom Essentials", popularity: 50, sales: "19%", color: "#29b9f5" },
  { name: "Apple Smartwatch", popularity: 31, sales: "29%", color: "#e8b6e4" },
];

const visitorValues = [
  100, 72, 118, 94, 108, 86, 142, 180, 420, 255, 218, 245, 210, 226, 205,
  300, 515, 450, 425, 505, 460, 300, 420, 465, 430, 475, 430, 410, 425, 470,
  300, 275, 340, 285, 265, 180, 265, 220, 315,
];

function VisitorChart() {
  const points = visitorValues
    .map((value, index) => `${(index / (visitorValues.length - 1)) * 400},${150 - (value / 550) * 140}`)
    .join(" ");

  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="0 0 430 190"
      role="img"
      aria-label="Visitor insights chart from January through December"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="visitor-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a5e0d9" stopOpacity=".68" />
          <stop offset="100%" stopColor="#a5e0d9" stopOpacity=".03" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5].map((tick) => {
        const y = 150 - (tick / 5) * 140;
        return (
          <g key={tick}>
            <text x="0" y={y + 4} className="fill-slate-300" fontSize="10">
              {tick * 100}
            </text>
            <line x1="32" x2="425" y1={y} y2={y} stroke="#30313d" strokeWidth="1" />
          </g>
        );
      })}
      <polygon points={`32,150 ${points.split(" ").map((point) => {
        const [x, y] = point.split(",").map(Number);
        return `${x + 32},${y}`;
      }).join(" ")} 432,150`} fill="url(#visitor-fill)" />
      <polyline
        points={points.split(" ").map((point) => {
          const [x, y] = point.split(",").map(Number);
          return `${x + 32},${y}`;
        }).join(" ")}
        fill="none"
        stroke="#a5e0d9"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line x1="214" x2="214" y1="10" y2="151" stroke="#ffb547" strokeDasharray="2 3" />
      <circle cx="214" cy="21" r="4" fill="#ffb547" />
      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
        (month, index) => (
          <text
            key={month}
            x={34 + index * 35.5}
            y="175"
            textAnchor="middle"
            className="fill-slate-300"
            fontSize="9"
          >
            {month}
          </text>
        ),
      )}
    </svg>
  );
}

function FulfilmentChart() {
  return (
    <svg
      className="w-full"
      viewBox="0 0 280 150"
      role="img"
      aria-label="Customer fulfilment comparison between last month and this month"
    >
      <defs>
        <linearGradient id="last-month-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a5e0d9" stopOpacity=".55" />
          <stop offset="100%" stopColor="#a5e0d9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="this-month-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8b6e4" stopOpacity=".5" />
          <stop offset="100%" stopColor="#e8b6e4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M8 20 L48 40 L91 28 L126 48 L151 48 L190 25 L230 43 L260 65 L276 12 L276 125 L8 125 Z" fill="url(#last-month-fill)" />
      <path d="M8 20 L48 40 L91 28 L126 48 L151 48 L190 25 L230 43 L260 65 L276 12" fill="none" stroke="#a5e0d9" strokeWidth="2" />
      <path d="M8 78 L48 72 L75 57 L112 101 L151 101 L190 87 L230 91 L260 94 L276 60 L276 125 L8 125 Z" fill="url(#this-month-fill)" />
      <path d="M8 78 L48 72 L75 57 L112 101 L151 101 L190 87 L230 91 L260 94 L276 60" fill="none" stroke="#e8b6e4" strokeWidth="2" />
      {[ [8,20], [48,40], [91,28], [126,48], [151,48], [190,25], [230,43], [260,65], [276,12] ].map(([x, y]) => (
        <circle key={`last-${x}-${y}`} cx={x} cy={y} r="2.5" fill="#a5e0d9" />
      ))}
      {[ [8,78], [48,72], [75,57], [112,101], [151,101], [190,87], [230,91], [260,94], [276,60] ].map(([x, y]) => (
        <circle key={`this-${x}-${y}`} cx={x} cy={y} r="2.5" fill="#e8b6e4" />
      ))}
    </svg>
  );
}

function Home() {
  const user = getStoredUser();
  const greeting = user ? `Welcome back, ${user.username}` : "Welcome";

  return (
    <div className="min-h-screen bg-[#171821] p-3 text-slate-100 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* Dashboard Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            {greeting} — here's your business overview.
          </p>
        </header>

        {/* Today's Sales */}
        <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
          <CardHeader className="px-5 pb-5 pt-5 sm:px-6">
            <CardTitle className="text-xl font-bold sm:text-2xl">
              Today’s Sales
            </CardTitle>
            <p className="text-sm text-slate-400">
              Sales Summary
            </p>
          </CardHeader>

          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {salesStats.map(({ label, value, change, color, icon: Icon }) => (
                <article
                  key={label}
                  className="min-w-0 rounded-xl border border-white/[0.06] bg-[#171821] p-5 transition-all duration-200 hover:border-white/15 hover:bg-[#1b1c27]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-400 sm:text-base">
                      {label}
                    </p>

                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={24} style={{ color }} />
                    </div>
                  </div>

                  <p className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {value}
                  </p>

                  <p className="mt-3 text-sm font-medium" style={{ color }}>
                    {change}
                  </p>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Row */}
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">

          {/* Top Products */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <CardTitle className="text-xl font-bold sm:text-2xl">
                Top Products
              </CardTitle>
              <p className="text-sm text-slate-400">
                Best-performing products this period
              </p>
            </CardHeader>

            <CardContent className="min-w-0 px-3 pb-5 sm:px-5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-10 text-sm font-semibold text-slate-400">
                      #
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-slate-400">
                      Product
                    </TableHead>
                    <TableHead className="min-w-[105px] text-sm font-semibold text-slate-400">
                      Popularity
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold text-slate-400">
                      Sales
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product.name}
                      className="border-white/[0.06] transition-colors hover:bg-white/[0.03]"
                    >
                      <TableCell className="py-5 text-sm font-medium text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>

                      <TableCell className="max-w-[180px] truncate py-5 text-sm font-semibold text-white sm:text-base">
                        {product.name}
                      </TableCell>

                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#343542]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, product.popularity))}%`,
                                backgroundColor: product.color,
                              }}
                            />
                          </div>
                          <span className="w-9 text-right text-xs font-semibold text-slate-300">
                            {product.popularity}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-5 text-right">
                        <span
                          className="inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm"
                          style={{
                            color: product.color,
                            borderColor: `${product.color}66`,
                            backgroundColor: `${product.color}15`,
                          }}
                        >
                          {product.sales}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 pb-2 pt-5">
              <div>
                <CardTitle className="text-xl font-bold sm:text-2xl">
                  Earnings
                </CardTitle>
                <p className="mt-1 text-sm text-slate-400">
                  Total Expense
                </p>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#30313d]">
                <Wallet className="size-5 text-[#a5e0d9]" />
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <p className="mt-4 text-3xl font-bold tracking-tight text-[#a5e0d9] sm:text-4xl">
                $6,078.76
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-sm font-semibold text-emerald-400">
                  <TrendingUp className="size-4" />
                  48%
                </span>
                <span className="text-sm text-slate-400">
                  More than last month
                </span>
              </div>

              <div className="mx-auto mt-6 w-full max-w-[230px]">
                <svg
                  viewBox="0 0 200 115"
                  className="block h-auto w-full"
                  role="img"
                  aria-label="Earnings performance is 80 percent"
                >
                  <path
                    d="M20 100 A80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#343542"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 100 A80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#a5e0d9"
                    strokeWidth="20"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="80 100"
                  />
                  <text
                    x="100"
                    y="91"
                    textAnchor="middle"
                    fill="white"
                    fontSize="27"
                    fontWeight="700"
                  >
                    80%
                  </text>
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                  >
                    Performance
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Row */}
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-2">

          {/* Customer Fulfilment */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
            <CardHeader className="px-5 pb-1 pt-5 sm:px-6">
              <CardTitle className="text-xl font-bold sm:text-2xl">
                Customer Fulfilment
              </CardTitle>
              <p className="text-sm text-slate-400">
                Monthly performance comparison
              </p>
            </CardHeader>

            <CardContent className="px-4 pb-5 sm:px-5">
              <div className="mt-3 min-w-0">
                <FulfilmentChart />
              </div>

              <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-4">
                <div className="px-2">
                  <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <span className="size-2.5 rounded-full bg-[#a5e0d9]" />
                    Last Month
                  </p>
                  <p className="mt-2 text-center text-xl font-bold text-white sm:text-2xl">
                    $4,087
                  </p>
                </div>

                <div className="px-2">
                  <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <span className="size-2.5 rounded-full bg-[#e8b6e4]" />
                    This Month
                  </p>
                  <p className="mt-2 text-center text-xl font-bold text-white sm:text-2xl">
                    $5,506
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitor Insights */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
            <CardHeader className="flex flex-col gap-3 px-5 pb-1 pt-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <CardTitle className="text-xl font-bold sm:text-2xl">
                  Visitor Insights
                </CardTitle>
                <p className="mt-1 text-sm text-slate-400">
                  Visitor activity throughout the year
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#171821] px-3 py-2 text-xs font-medium text-slate-300">
                <span className="size-2 rounded-full bg-[#a5e0d9]" />
                New Visitors
              </span>
            </CardHeader>

            <CardContent className="min-w-0 px-3 pb-5 pt-4 sm:px-5">
              <div className="h-[220px] min-w-0 sm:h-[250px]">
                <VisitorChart />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
} 

export default Home;
