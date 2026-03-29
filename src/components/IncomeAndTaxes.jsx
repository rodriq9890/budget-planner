import { calculateTaxBreakdown } from "../utils/taxCalculator"
import { getAllStates, getCitiesForState, getStateFromZip } from "../utils/stateTaxData"
import PieChart from "./PieChart"

function IncomeAndTaxes({ data, setData, t, isDark }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value })
  }

  const handleZipChange = (zip) => {
    const updates = { ...data, zipCode: zip }
    if (zip.length >= 5) {
      const result = getStateFromZip(zip)
      if (result) {
        updates.stateCode = result.stateCode
        updates.cityName = result.city || ""
      }
    }
    setData(updates)
  }

  const handleStateChange = (stateCode) => {
    const cities = getCitiesForState(stateCode)
    setData({ ...data, stateCode, cityName: cities.length > 0 ? "" : "" })
  }

  const results = calculateTaxBreakdown(data)
  const allStates = getAllStates()
  const availableCities = getCitiesForState(data.stateCode || "")

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <div>
          <h2 className={`text-xl font-semibold mb-1 ${t.heading}`}>Income & Taxes</h2>
          <p className={`${t.subtle} text-sm`}>Enter your location, gross salary, and pre-tax deductions.</p>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Location</h3>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={`text-sm ${t.muted}`}>Zip Code</span>
              <input
                type="text"
                maxLength={5}
                value={data.zipCode || ""}
                onChange={(e) => handleZipChange(e.target.value.replace(/\D/g, ""))}
                placeholder="10001"
                className={`w-full mt-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              />
            </label>

            <label className="block">
              <span className={`text-sm ${t.muted}`}>State</span>
              <select
                value={data.stateCode || ""}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full mt-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              >
                <option value="">Select state</option>
                {allStates.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}{s.noTax ? " (no income tax)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {availableCities.length > 0 && (
            <label className="block">
              <span className={`text-sm ${t.muted}`}>City (local tax)</span>
              <select
                value={data.cityName || ""}
                onChange={(e) => handleChange("cityName", e.target.value)}
                className={`w-full mt-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              >
                <option value="">None</option>
                {availableCities.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
          )}

          {data.stateCode && !results.hasStateTax && (
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-3 text-sm text-emerald-400">
              {allStates.find((s) => s.code === data.stateCode)?.name} has no state income tax!
            </div>
          )}
        </div>

        {/* Income */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Income</h3>
          <label className="block">
            <span className={`text-sm ${t.muted}`}>Annual Gross Salary</span>
            <div className="relative mt-1">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtle}`}>$</span>
              <input
                type="number"
                value={data.grossSalary || ""}
                onChange={(e) => handleChange("grossSalary", Number(e.target.value))}
                placeholder="0"
                className={`w-full rounded-lg pl-8 pr-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              />
            </div>
          </label>
        </div>

        {/* Pre-Tax Deductions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Pre-Tax Deductions</h3>

          <label className="block">
            <span className={`text-sm ${t.muted}`}>401k Contribution (%)</span>
            <div className="relative mt-1">
              <input
                type="number"
                value={data.retirement401k || ""}
                onChange={(e) => handleChange("retirement401k", Number(e.target.value))}
                placeholder="6"
                className={`w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.subtle}`}>%</span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "HSA (per month)", field: "hsa" },
              { label: "Health Insurance (per month)", field: "healthInsurance" },
              { label: "Dental (per month)", field: "dental" },
              { label: "Vision (per month)", field: "vision" },
            ].map(({ label, field }) => (
              <label key={field} className="block">
                <span className={`text-sm ${t.muted}`}>{label}</span>
                <div className="relative mt-1">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtle}`}>$</span>
                  <input
                    type="number"
                    value={data[field] || ""}
                    onChange={(e) => handleChange(field, Number(e.target.value))}
                    placeholder="0"
                    className={`w-full rounded-lg pl-8 pr-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Live Results */}
      <div className="lg:col-span-2">
        <div className={`border rounded-xl p-6 sticky top-8 space-y-6 ${t.card}`}>
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Take-Home Pay</h3>

          <div>
            <p className="text-3xl font-bold">{formatMoney(results.monthlyNet)}</p>
            <p className={`text-sm ${t.subtle}`}>per month</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-semibold">{formatMoney(results.biweeklyNet)}</p>
              <p className={`text-xs ${t.subtle}`}>per paycheck</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatMoney(results.annualNet)}</p>
              <p className={`text-xs ${t.subtle}`}>per year</p>
            </div>
          </div>

          <div className={`border-t pt-4 space-y-3 ${t.border}`}>
            <h4 className={`text-xs font-medium uppercase tracking-wide ${t.subtle}`}>Tax Breakdown (Annual)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={t.muted}>Federal</span>
                <span>{formatMoney(results.federalTax)}</span>
              </div>
              {results.hasStateTax && (
                <div className="flex justify-between">
                  <span className={t.muted}>
                    {allStates.find((s) => s.code === data.stateCode)?.name || "State"}
                  </span>
                  <span>{formatMoney(results.stateTax)}</span>
                </div>
              )}
              {results.cityTax > 0 && (
                <div className="flex justify-between">
                  <span className={t.muted}>{data.cityName}</span>
                  <span>{formatMoney(results.cityTax)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={t.muted}>Social Security</span>
                <span>{formatMoney(results.socialSecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span className={t.muted}>Medicare</span>
                <span>{formatMoney(results.medicare)}</span>
              </div>
              <div className={`flex justify-between border-t pt-2 font-medium ${t.border}`}>
                <span>Total Tax</span>
                <span className="text-red-400">{formatMoney(results.totalTax)}</span>
              </div>
            </div>
          </div>

          <div className={`border-t pt-4 space-y-2 text-sm ${t.border}`}>
            <h4 className={`text-xs font-medium uppercase tracking-wide ${t.subtle}`}>Pre-Tax Deductions (Annual)</h4>
            <div className="flex justify-between">
              <span className={t.muted}>401k + Benefits</span>
              <span>{formatMoney(results.preTaxDeductions)}</span>
            </div>
            <div className={`flex justify-between border-t pt-2 font-medium ${t.border}`}>
              <span>Total Deductions</span>
              <span className="text-red-400">{formatMoney(results.totalDeductions)}</span>
            </div>
          </div>

          {results.gross > 0 && (
            <div className={`rounded-lg p-3 text-center ${t.pill}`}>
              <p className={`text-sm ${t.muted}`}>Effective Tax Rate</p>
              <p className="text-xl font-bold">
                {((results.totalTax / results.gross) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {results.gross > 0 && (
            <div className={`border-t pt-4 space-y-6 ${t.border}`}>
              <PieChart
                title="Pre-Tax Breakdown"
                size={180}
                isDark={isDark}
                slices={[
                  { label: "Federal", value: results.federalTax, color: "#ef4444" },
                  ...(results.hasStateTax ? [{ label: "State", value: results.stateTax, color: "#f97316" }] : []),
                  ...(results.cityTax > 0 ? [{ label: data.cityName, value: results.cityTax, color: "#eab308" }] : []),
                  { label: "FICA", value: results.socialSecurity + results.medicare, color: "#f43f5e" },
                  { label: "401k + Benefits", value: results.preTaxDeductions, color: "#8b5cf6" },
                  { label: "Take-Home", value: results.annualNet, color: "#10b981" },
                ]}
              />
              <PieChart
                title="Post-Tax (Take-Home Usage)"
                size={180}
                isDark={isDark}
                slices={[
                  { label: "Take-Home Pay", value: results.annualNet, color: "#10b981" },
                  { label: "Total Tax", value: results.totalTax, color: "#ef4444" },
                  { label: "Pre-Tax Deductions", value: results.preTaxDeductions, color: "#8b5cf6" },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncomeAndTaxes