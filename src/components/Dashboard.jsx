import { calculateTaxBreakdown } from "../utils/taxCalculator"
import { exportToPDF, exportToExcel } from "../utils/exportBudget"
import PieChart from "./PieChart"

function Dashboard({ data, setData, t, isDark }) {
  const results = calculateTaxBreakdown(data)

  const expenses = data.monthlyExpenses || []
  const monthlySubs = data.monthlySubs || []
  const annualSubs = data.annualSubs || []
  const extraGoals = data.extraGoals || []

  const monthlyEssentials = expenses.filter((e) => e.essential !== false).reduce((sum, e) => sum + (e.amount || 0), 0)  
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

  const needsRatio = (data.budgetNeeds ?? 50) / 100
  const wantsRatio = (data.budgetWants ?? 30) / 100
  const savingsRatio = (data.budgetSavings ?? 20) / 100
  const idealNeeds = results.monthlyNet * needsRatio
  const idealWants = results.monthlyNet * wantsRatio
  const idealSavings = results.monthlyNet * savingsRatio

  if (!data.grossSalary) {
    return (
      <div className="text-center py-20">
        <p className={`text-lg ${t.subtle}`}>Enter your salary on Step 1 to see your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold mb-1 ${t.heading}`}>Dashboard</h2>
          <p className={`${t.subtle} text-sm`}>Your complete financial picture at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToPDF(data)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            PDF
          </button>
          <button
            onClick={() => exportToExcel(data)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Income", value: fmt(data.grossSalary / 12), sub: `${fmt(data.grossSalary)}/yr`, color: "" },
          { label: "Take-Home", value: fmt(results.monthlyNet), sub: `${fmt(results.annualNet)}/yr`, color: "text-emerald-400" },
          { label: "Total Committed", value: fmt(totalSpent), sub: `${pct(totalSpent)} of take-home`, color: "" },
          { label: "Remaining", value: fmt(remaining), sub: "free to spend", color: remaining >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className={`border rounded-xl p-5 ${t.card}`}>
            <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            <p className={`text-xs ${t.subtle}`}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`border rounded-xl p-6 space-y-5 ${t.card}`}>
  <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
    Budget Rule
  </h3>
  <div className="flex flex-wrap gap-3 items-center">
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={data.budgetNeeds ?? 50}
        onChange={(e) => setData({ ...data, budgetNeeds: e.target.value === "" ? "" : Number(e.target.value) })}
        className={`w-12 text-center rounded px-1 py-0.5 text-sm border ${t.input}`}
      />
      <span className={`text-xs ${t.subtle}`}>Needs</span>
    </div>
    <span className={t.subtle}>/</span>
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={data.budgetWants ?? 30}
        onChange={(e) => setData({ ...data, budgetWants: e.target.value === "" ? "" : Number(e.target.value) })}
        className={`w-12 text-center rounded px-1 py-0.5 text-sm border ${t.input}`}
      />
      <span className={`text-xs ${t.subtle}`}>Wants</span>
    </div>
    <span className={t.subtle}>/</span>
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={data.budgetSavings ?? 20}
        onChange={(e) => setData({ ...data, budgetSavings: e.target.value === "" ? "" : Number(e.target.value) })}
        className={`w-12 text-center rounded px-1 py-0.5 text-sm border ${t.input}`}
      />
      <span className={`text-xs ${t.subtle}`}>Savings</span>
    </div>
    {(() => {
  const total = (data.budgetNeeds ?? 50) + (data.budgetWants ?? 30) + (data.budgetSavings ?? 20)
  if (total === 100) return <span className="text-emerald-400 text-xs">✓ 100%</span>
  return (
    <span className={`text-xs font-medium ${total > 100 ? "text-red-400" : "text-yellow-400"}`}>
      {total}% — {total > 100 ? `${total - 100}% over` : `${100 - total}% under`}
    </span>
  )
})()}
  </div>

  {(data.budgetNeeds ?? 50) + (data.budgetWants ?? 30) + (data.budgetSavings ?? 20) === 100 && (
    <>
      {[
    { label: `Needs (${data.budgetNeeds ?? 50}%)`, value: totalNeeds, ideal: idealNeeds, color: "bg-blue-500" },
    { label: `Wants (${data.budgetWants ?? 30}%)`, value: totalWants + remaining, ideal: idealWants, color: totalWants > idealWants ? "bg-red-500" : "bg-purple-500" },
    { label: `Savings (${data.budgetSavings ?? 20}%)`, value: totalSavings, ideal: idealSavings, color: "bg-emerald-500" },
  ].map(({ label, value, ideal, color }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={t.muted}>{label}</span>
                <span>{fmt(value)} / {fmt(ideal)}</span>
              </div>
              <div className={`w-full rounded-full h-3 ${t.pill}`}>
                <div
                  className={`${color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, (value / ideal) * 100)}%` }}
                />
              </div>
              <p className={`text-xs ${t.subtle}`}>
                {value <= ideal
                  ? `${fmt(ideal - value)} under budget`
                  : `${fmt(value - ideal)} over budget`}
              </p>
            </div>
            ))} 
          </> 
          )}
        </div>

        <div className={`border rounded-xl p-6 space-y-4 ${t.card}`}>
          <PieChart
            title="Monthly Budget Breakdown"
            size={200}
            formatMoney={fmt}
            isDark={isDark}
            slices={[
              { label: "Needs", value: totalNeeds, color: "#3b82f6" },
              { label: "Wants", value: totalWants, color: "#a855f7" },
              { label: "Savings", value: totalSavings, color: "#10b981" },
              { label: "Remaining", value: Math.max(0, remaining), color: isDark ? "#374151" : "#d1d5db" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: "Needs", color: "bg-blue-500", total: totalNeeds, items: expenses.filter((e) => e.amount > 0).map((e) => ({ key: e.id, name: e.name, amount: e.amount })) },
          { label: "Wants", color: "bg-purple-500", total: totalWants, items: [
            ...monthlySubs.filter((s) => s.amount > 0).map((s) => ({ key: `m${s.id}`, name: s.name, amount: s.amount })),
            ...annualSubs.filter((s) => s.amount > 0).map((s) => ({ key: `a${s.id}`, name: s.name, amount: s.amount / 12 })),
          ]},
          { label: "Savings", color: "bg-emerald-500", total: totalSavings, items: [
            ...(emergencyDeposit > 0 ? [{ key: "ef", name: "Emergency Fund", amount: emergencyDeposit }] : []),
            ...extraGoals.filter((g) => g.amount > 0).map((g) => ({ key: g.id, name: g.name, amount: g.amount })),
          ]},
        ].map(({ label, color, total, items }) => (
          <div key={label} className={`border rounded-xl p-5 space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <h4 className="text-sm font-medium">{label}</h4>
              <span className={`text-sm ml-auto ${t.subtle}`}>{fmt(total)}/mo</span>
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <span className={t.muted}>{item.name}</span>
                  <span>{fmt(item.amount)}/mo</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`border rounded-xl p-6 ${t.card}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              Savings Rate
            </h3>
            <p className={`${t.subtle} text-xs mt-1`}>
              Including 401k and HSA contributions
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {((
                (totalSavings * 12 + (data.grossSalary * (data.retirement401k || 0)) / 100 + (data.hsa || 0) * 12) /
                data.grossSalary
              ) * 100).toFixed(1)}%
            </p>
            <p className={`text-xs ${t.subtle}`}>of gross income</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard