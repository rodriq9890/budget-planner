import { useState } from "react"
import { calculateTaxBreakdown } from "../utils/taxCalculator"

function IncomeBar({ data, t }) {
  const results = calculateTaxBreakdown(data)
  if (!data.grossSalary) return null

  const [hovered, setHovered] = useState(null)

  const fmt = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(v))

  const monthlyNet = results.monthlyNet

  // Fixed essential (🛡️) + non-essential (✦) — variable (🧾) is left in "left to spend"
  const fixedExpenses = (data.monthlyExpenses || [])
    .filter((e) => e.essential !== "variable" && (e.amount || 0) > 0)
  const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)

  const effectiveMonthlySub = (s) =>
    Math.max(0, (s.amount || 0) - (s.hasDiscount ? (s.discount || 0) : 0))

  const monthlySubs = (data.monthlySubs || []).filter((s) => (s.amount || 0) > 0)
  const annualSubs = (data.annualSubs || []).filter((s) => (s.amount || 0) > 0)
  const subsTotal =
    monthlySubs.reduce((sum, s) => sum + effectiveMonthlySub(s), 0) +
    annualSubs.reduce((sum, s) => sum + s.amount / 12, 0)

  const emergencyDeposit = data.monthlyEmergencyDeposit || 0
  const extraGoals = (data.extraGoals || []).filter((g) => (g.amount || 0) > 0)
  const savingsTotal = emergencyDeposit + extraGoals.reduce((sum, g) => sum + g.amount, 0)

  const remaining = monthlyNet - fixedTotal - subsTotal - savingsTotal
  const remainingColor = remaining >= 0 ? "text-emerald-400" : "text-red-400"

  const hasDeductions = fixedTotal > 0 || subsTotal > 0 || savingsTotal > 0

  const Tooltip = ({ items, total }) => (
    <div
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 min-w-[180px] rounded-lg border shadow-xl text-xs ${t.card}`}
      style={{ pointerEvents: "none" }}
    >
      <div className="px-3 py-2 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between gap-4">
            <span className={`truncate max-w-[120px] ${t.muted}`}>{item.label}</span>
            <span className="shrink-0 font-medium">{fmt(item.amount)}{item.suffix || ""}</span>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className={`flex justify-between px-3 py-1.5 border-t font-semibold ${t.border}`}>
          <span className={t.subtle}>Total</span>
          <span>{fmt(total)}</span>
        </div>
      )}
    </div>
  )

  const Arrow = () => <span className="text-gray-600 select-none">→</span>

  return (
    <div className={`border rounded-lg px-5 py-3 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${t.card}`}>
      <div className="flex items-center gap-1.5">
        <span className={t.subtle}>Take-Home</span>
        <span className="text-emerald-400 font-semibold">{fmt(monthlyNet)}</span>
        <span className={`text-xs ${t.subtle}`}>/mo</span>
      </div>

      {fixedTotal > 0 && (
        <>
          <Arrow />
          <div
            className="relative flex items-center gap-1.5 cursor-default"
            onMouseEnter={() => setHovered("fixed")}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === "fixed" && (
              <Tooltip
                total={fixedTotal}
                items={fixedExpenses.map((e) => ({
                  label: `${e.essential === false ? "✦" : "🛡️"} ${e.name || "Unnamed"}`,
                  amount: e.amount,
                }))}
              />
            )}
            <span className={`underline decoration-dashed underline-offset-2 ${t.subtle}`}>
              Fixed Expenses
            </span>
            <span className="text-red-400 font-medium">−{fmt(fixedTotal)}</span>
          </div>
        </>
      )}

      {subsTotal > 0 && (
        <>
          <Arrow />
          <div
            className="relative flex items-center gap-1.5 cursor-default"
            onMouseEnter={() => setHovered("subs")}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === "subs" && (
              <Tooltip
                total={subsTotal}
                items={[
                  ...monthlySubs.map((s) => ({
                    label: s.name || "Unnamed",
                    amount: effectiveMonthlySub(s),
                    suffix: "/mo",
                  })),
                  ...annualSubs.map((s) => ({
                    label: s.name || "Unnamed",
                    amount: s.amount / 12,
                    suffix: "/mo",
                  })),
                ]}
              />
            )}
            <span className={`underline decoration-dashed underline-offset-2 ${t.subtle}`}>
              Subscriptions
            </span>
            <span className="text-red-400 font-medium">−{fmt(subsTotal)}</span>
          </div>
        </>
      )}

      {savingsTotal > 0 && (
        <>
          <Arrow />
          <div
            className="relative flex items-center gap-1.5 cursor-default"
            onMouseEnter={() => setHovered("savings")}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === "savings" && (
              <Tooltip
                total={savingsTotal}
                items={[
                  ...(emergencyDeposit > 0
                    ? [{ label: "Emergency Fund", amount: emergencyDeposit }]
                    : []),
                  ...extraGoals.map((g) => ({
                    label: g.name || "Unnamed goal",
                    amount: g.amount,
                  })),
                ]}
              />
            )}
            <span className={`underline decoration-dashed underline-offset-2 ${t.subtle}`}>
              Savings
            </span>
            <span className="text-blue-400 font-medium">−{fmt(savingsTotal)}</span>
          </div>
        </>
      )}

      {hasDeductions && (
        <>
          <Arrow />
          <div className="flex items-center gap-1.5">
            <span className={t.subtle}>Left to spend</span>
            <span className={`font-bold text-base ${remainingColor}`}>{fmt(remaining)}</span>
            <span className={`text-xs ${t.subtle}`}>/mo</span>
          </div>
        </>
      )}
    </div>
  )
}

export default IncomeBar
