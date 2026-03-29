import { calculateTaxBreakdown } from "../utils/taxCalculator"

function IncomeBar({ data, t }) {
  const results = calculateTaxBreakdown(data)
  if (!data.grossSalary) return null

  const fmt = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v)

  return (
    <div className={`border rounded-lg px-5 py-3 mb-6 flex items-center gap-6 text-sm ${t.card}`}>
      <div>
        <span className={t.subtle}>Monthly Take-Home: </span>
        <span className="text-emerald-400 font-semibold">{fmt(results.monthlyNet)}</span>
      </div>
      <div>
        <span className={t.subtle}>Per Paycheck: </span>
        <span className="font-medium">{fmt(results.biweeklyNet)}</span>
      </div>
      <div>
        <span className={t.subtle}>Annual Net: </span>
        <span className="font-medium">{fmt(results.annualNet)}</span>
      </div>
    </div>
  )
}

export default IncomeBar