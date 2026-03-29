import { calculateTaxBreakdown } from "../utils/taxCalculator"

function IncomeBar({ data }) {
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
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-3 mb-6 flex items-center gap-6 text-sm">
      <div>
        <span className="text-gray-500">Monthly Take-Home: </span>
        <span className="text-emerald-400 font-semibold">{fmt(results.monthlyNet)}</span>
      </div>
      <div>
        <span className="text-gray-500">Per Paycheck: </span>
        <span className="text-white font-medium">{fmt(results.biweeklyNet)}</span>
      </div>
      <div>
        <span className="text-gray-500">Annual Net: </span>
        <span className="text-white font-medium">{fmt(results.annualNet)}</span>
      </div>
    </div>
  )
}

export default IncomeBar