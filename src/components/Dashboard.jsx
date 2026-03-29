import { calculateTaxBreakdown } from "../utils/taxCalculator"
import { exportToPDF, exportToExcel } from "../utils/exportBudget"
import PieChart from "./PieChart"

function Dashboard({ data }) {
  const results = calculateTaxBreakdown(data)

  const expenses = data.monthlyExpenses || []
  const monthlySubs = data.monthlySubs || []
  const annualSubs = data.annualSubs || []
  const extraGoals = data.extraGoals || []

  const monthlyEssentials = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const monthlySubsTotal = monthlySubs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const annualSubsMonthly = annualSubs.reduce((sum, s) => sum + (s.amount || 0), 0) / 12
  const emergencyDeposit = data.monthlyEmergencyDeposit || 0
  const extraGoalsTotal = extraGoals.reduce((sum, g) => sum + (g.amount || 0), 0)

  const totalNeeds = monthlyEssentials
  const totalWants = monthlySubsTotal + annualSubsMonthly
  const totalSavings = emergencyDeposit + extraGoalsTotal
  const totalSpent = totalNeeds + totalWants + totalSavings
  const remaining = results.monthlyNet - totalSpent

  const fmt = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v)

  const pct = (v) => {
    if (results.monthlyNet <= 0) return "0%"
    return ((v / results.monthlyNet) * 100).toFixed(1) + "%"
  }

  // 50/30/20 targets
  const idealNeeds = results.monthlyNet * 0.5
  const idealWants = results.monthlyNet * 0.3
  const idealSavings = results.monthlyNet * 0.2

  if (!data.grossSalary) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Enter your salary on Step 1 to see your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Dashboard</h2>
          <p className="text-gray-500 text-sm">Your complete financial picture at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToPDF(data)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportToExcel(data)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gross Income</p>
          <p className="text-2xl font-bold text-white mt-1">{fmt(data.grossSalary / 12)}</p>
          <p className="text-xs text-gray-600">{fmt(data.grossSalary)}/yr</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Take-Home</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(results.monthlyNet)}</p>
          <p className="text-xs text-gray-600">{fmt(results.annualNet)}/yr</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Committed</p>
          <p className="text-2xl font-bold text-white mt-1">{fmt(totalSpent)}</p>
          <p className="text-xs text-gray-600">{pct(totalSpent)} of take-home</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(remaining)}
          </p>
          <p className="text-xs text-gray-600">free to spend</p>
        </div>
      </div>

      {/* Budget breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 50/30/20 comparison */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
            50 / 30 / 20 Rule
          </h3>

          {/* Needs */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Needs (50%)</span>
              <span className="text-white">{fmt(totalNeeds)} / {fmt(idealNeeds)}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 relative">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalNeeds / idealNeeds) * 100)}%` }}
              />
              <div
                className="absolute top-0 h-3 w-0.5 bg-white/50"
                style={{ left: "100%" }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {totalNeeds <= idealNeeds
                ? `${fmt(idealNeeds - totalNeeds)} under budget`
                : `${fmt(totalNeeds - idealNeeds)} over budget`}
            </p>
          </div>

          {/* Wants */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Wants (30%)</span>
              <span className="text-white">{fmt(totalWants)} / {fmt(idealWants)}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalWants > idealWants ? "bg-red-500" : "bg-purple-500"
                }`}
                style={{ width: `${Math.min(100, (totalWants / idealWants) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {totalWants <= idealWants
                ? `${fmt(idealWants - totalWants)} under budget`
                : `${fmt(totalWants - idealWants)} over budget`}
            </p>
          </div>

          {/* Savings */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Savings (20%)</span>
              <span className="text-white">{fmt(totalSavings)} / {fmt(idealSavings)}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalSavings / idealSavings) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {totalSavings >= idealSavings
                ? `${fmt(totalSavings - idealSavings)} above target`
                : `${fmt(idealSavings - totalSavings)} below target`}
            </p>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <PieChart
            title="Monthly Budget Breakdown"
            size={200}
            formatMoney={fmt}
            slices={[
              { label: "Needs", value: totalNeeds, color: "#3b82f6" },
              { label: "Wants", value: totalWants, color: "#a855f7" },
              { label: "Savings", value: totalSavings, color: "#10b981" },
              { label: "Remaining", value: Math.max(0, remaining), color: "#374151" },
            ]}
          />
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h4 className="text-sm font-medium text-white">Needs</h4>
            <span className="text-sm text-gray-500 ml-auto">{fmt(totalNeeds)}/mo</span>
          </div>
          <div className="space-y-1.5">
            {expenses
              .filter((e) => e.amount > 0)
              .map((e) => (
                <div key={e.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{e.name}</span>
                  <span className="text-gray-300">{fmt(e.amount)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Wants */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <h4 className="text-sm font-medium text-white">Wants</h4>
            <span className="text-sm text-gray-500 ml-auto">{fmt(totalWants)}/mo</span>
          </div>
          <div className="space-y-1.5">
            {monthlySubs
              .filter((s) => s.amount > 0)
              .map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{s.name}</span>
                  <span className="text-gray-300">{fmt(s.amount)}/mo</span>
                </div>
              ))}
            {annualSubs
              .filter((s) => s.amount > 0)
              .map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{s.name}</span>
                  <span className="text-gray-300">{fmt(s.amount / 12)}/mo</span>
                </div>
              ))}
          </div>
        </div>

        {/* Savings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-medium text-white">Savings</h4>
            <span className="text-sm text-gray-500 ml-auto">{fmt(totalSavings)}/mo</span>
          </div>
          <div className="space-y-1.5">
            {emergencyDeposit > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Emergency Fund</span>
                <span className="text-gray-300">{fmt(emergencyDeposit)}/mo</span>
              </div>
            )}
            {extraGoals
              .filter((g) => g.amount > 0)
              .map((g) => (
                <div key={g.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{g.name}</span>
                  <span className="text-gray-300">{fmt(g.amount)}/mo</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Savings rate */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              Savings Rate
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Including 401k and HSA contributions
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {((
                (totalSavings * 12 + (data.grossSalary * (data.retirement401k || 0)) / 100 + (data.hsa || 0) * 12) /
                data.grossSalary
              ) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">of gross income</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard