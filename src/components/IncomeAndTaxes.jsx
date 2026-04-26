import { useState } from "react"
import { calculateTaxBreakdown } from "../utils/taxCalculator"
import { getAllStates, getCitiesForState, getStateFromZip } from "../utils/stateTaxData"
import PieChart from "./PieChart"



function IncomeAndTaxes({ data, setData, t, isDark }) {
  const [viewMode, setViewMode] = useState("monthly")
  const [showPaystub, setShowPaystub] = useState(false)
  const [paystubMode, setPaystubMode] = useState("average")
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

          <div className="flex gap-2">
            {["salary", "hourly"].map((type) => (
              <button
                key={type}
                onClick={() => handleChange("incomeType", type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (data.incomeType || "salary") === type
                    ? "bg-emerald-600 text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                {type === "salary" ? "Annual Salary" : "Hourly Wage"}
              </button>
            ))}
          </div>

          {(data.incomeType || "salary") === "salary" ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={`text-sm ${t.muted}`}>Hourly Rate</span>
                <div className="relative mt-1">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtle}`}>$</span>
                  <input
                    type="number"
                    value={data.hourlyRate || ""}
                    onChange={(e) => {
                      const rate = Number(e.target.value)
                      const hours = data.hoursPerWeek || 40
                      setData({ ...data, hourlyRate: rate, grossSalary: rate * hours * 52 })
                    }}
                    placeholder="0"
                    className={`w-full rounded-lg pl-8 pr-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
                  />
                </div>
              </label>
              <label className="block">
                <span className={`text-sm ${t.muted}`}>Hours per Week</span>
                <input
                  type="number"
                  value={data.hoursPerWeek || 40}
                  onChange={(e) => {
                    const hours = Number(e.target.value)
                    const rate = data.hourlyRate || 0
                    setData({ ...data, hoursPerWeek: hours, grossSalary: rate * hours * 52 })
                  }}
                  placeholder="40"
                  className={`w-full mt-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className={`text-sm ${t.muted}`}>Pay Frequency</span>
            <select
              value={data.payFrequency || "biweekly"}
              onChange={(e) => handleChange("payFrequency", e.target.value)}
              className={`w-full mt-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
            >
              <option value="weekly">Weekly (52 paychecks/yr)</option>
              <option value="biweekly">Bi-Weekly (26 paychecks/yr)</option>
              <option value="semimonthly">Semi-Monthly (24 paychecks/yr)</option>
              <option value="monthly">Monthly (12 paychecks/yr)</option>
            </select>
          </label>

          {(data.incomeType || "salary") === "hourly" && data.hourlyRate > 0 && (
            <div className={`border rounded-lg p-3 text-sm ${t.card}`}>
              <span className={t.muted}>Calculated annual salary: </span>
              <span className="text-emerald-400 font-medium">{formatMoney(data.grossSalary)}</span>
              <span className={t.muted}> ({data.hourlyRate}/hr × {data.hoursPerWeek || 40}hrs × 52 weeks)</span>
            </div>
          )}
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Take-Home Pay</h3>
            <div className="flex gap-1">
              {["monthly", "annual"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-emerald-600 text-white"
                      : isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {mode === "monthly" ? "Monthly" : "Annual"}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "monthly" ? (
            <>
              <div>
                <p className="text-3xl font-bold">{formatMoney(results.monthlyNet)}</p>
                <p className={`text-sm ${t.subtle}`}>per month</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-semibold">{formatMoney(results.biweeklyNet)}</p>
                  <p className={`text-xs ${t.subtle}`}>per paycheck ({data.payFrequency || "biweekly"})</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{results.paychecksPerYear / 12 % 1 === 0 ? results.paychecksPerYear / 12 : (results.paychecksPerYear / 12).toFixed(1)}</p>
                  <p className={`text-xs ${t.subtle}`}>paychecks/month</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-3xl font-bold">{formatMoney(results.annualNet)}</p>
                <p className={`text-sm ${t.subtle}`}>per year</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-semibold">{formatMoney(results.biweeklyNet)}</p>
                  <p className={`text-xs ${t.subtle}`}>per paycheck</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{results.paychecksPerYear}</p>
                  <p className={`text-xs ${t.subtle}`}>paychecks/year</p>
                </div>
              </div>
            </>
          )}

          <div className={`border-t pt-4 space-y-3 ${t.border}`}>
            <h4 className={`text-xs font-medium uppercase tracking-wide ${t.subtle}`}>
              Tax Breakdown ({viewMode === "monthly" ? "Monthly" : "Annual"})
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { label: "Federal", value: results.federalTax },
                ...(results.hasStateTax ? [{ label: allStates.find((s) => s.code === data.stateCode)?.name || "State", value: results.stateTax }] : []),
                ...(results.cityTax > 0 ? [{ label: data.cityName, value: results.cityTax }] : []),
                { label: "Social Security", value: results.socialSecurity },
                { label: "Medicare", value: results.medicare },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className={t.muted}>{label}</span>
                  <span>{formatMoney(viewMode === "monthly" ? value / 12 : value)}</span>
                </div>
              ))}
              <div className={`flex justify-between border-t pt-2 font-medium ${t.border}`}>
                <span>Total Tax</span>
                <span className="text-red-400">{formatMoney(viewMode === "monthly" ? results.totalTax / 12 : results.totalTax)}</span>
              </div>
            </div>
          </div>

          <div className={`border-t pt-4 space-y-2 text-sm ${t.border}`}>
            <h4 className={`text-xs font-medium uppercase tracking-wide ${t.subtle}`}>
              Pre-Tax Deductions ({viewMode === "monthly" ? "Monthly" : "Annual"})
            </h4>
            <div className="space-y-2">
              {[
                { label: "401(k)", value: results.deduction401k },
                { label: "HSA", value: results.deductionHSA },
                { label: "Health Insurance", value: results.deductionHealth },
                { label: "Dental", value: results.deductionDental },
                { label: "Vision", value: results.deductionVision },
              ]
                .filter(({ value }) => value > 0)
                .map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className={t.muted}>{label}</span>
                    <span>{formatMoney(viewMode === "monthly" ? value / 12 : value)}</span>
                  </div>
                ))}
            </div>
            <div className={`flex justify-between border-t pt-2 font-medium ${t.border}`}>
              <span>Total Deductions</span>
              <span className="text-red-400">{formatMoney(viewMode === "monthly" ? results.totalDeductions / 12 : results.totalDeductions)}</span>
            </div>
          </div>

          {results.gross > 0 && (
            <div className={`border-t pt-4 ${t.border}`}>
              <button
                onClick={() => setShowPaystub((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-wide"
              >
                <span className={t.subtle}>Paystub Preview (per paycheck)</span>
                <span className={t.subtle}>{showPaystub ? "▲" : "▼"}</span>
              </button>

              {showPaystub && (() => {
                const n = results.paychecksPerYear
                const isHourly = (data.incomeType || "salary") === "hourly"
                const avgHoursPerPeriod = ((data.hoursPerWeek || 40) * 52) / n

                // Gross per check in each mode
                const grossAvg = results.gross / n
                const gross80  = 80 * (data.hourlyRate || 0)
                const gross = paystubMode === "80hr" ? gross80 : grossAvg

                // Scale taxes proportionally from annual amounts
                // Fixed deductions (HSA, health, dental, vision) stay the same per period
                const scale = results.gross > 0 ? gross / (results.gross / n) : 1

                const taxes = [
                  { label: "Federal Tax",    value: (results.federalTax   / n) * scale },
                  ...(results.hasStateTax ? [{ label: (allStates.find((s) => s.code === data.stateCode)?.name || "State") + " Tax", value: (results.stateTax / n) * scale }] : []),
                  ...(results.cityTax > 0  ? [{ label: (data.cityName || "City") + " Tax", value: (results.cityTax / n) * scale }] : []),
                  { label: "Social Security", value: (results.socialSecurity / n) * scale },
                  { label: "Medicare",        value: (results.medicare      / n) * scale },
                ]

                // 401k scales with gross; fixed benefits stay flat
                const deductions = [
                  { label: "401(k)",           value: (results.deduction401k  / n) * scale },
                  { label: "HSA",              value:  results.deductionHSA   / n },
                  { label: "Health Insurance", value:  results.deductionHealth / n },
                  { label: "Dental",           value:  results.deductionDental / n },
                  { label: "Vision",           value:  results.deductionVision / n },
                ].filter(({ value }) => value > 0)

                const totalTaxes       = taxes.reduce((s, x) => s + x.value, 0)
                const totalDeductions  = deductions.reduce((s, x) => s + x.value, 0)
                const netPay           = gross - totalTaxes - totalDeductions

                return (
                  <div className={`mt-3 border rounded-lg overflow-hidden text-sm ${t.card}`}>
                    {/* Mode toggle — only meaningful for hourly */}
                    {isHourly && (
                      <div className={`flex border-b ${t.border}`}>
                        {[
                          { key: "average", label: `Avg (${avgHoursPerPeriod % 1 === 0 ? avgHoursPerPeriod : avgHoursPerPeriod.toFixed(1)} hrs)` },
                          { key: "80hr",    label: "80 hrs" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setPaystubMode(key)}
                            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                              paystubMode === key
                                ? "bg-emerald-600 text-white"
                                : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Gross */}
                    <div className={`px-3 py-2 space-y-0.5 border-b ${t.border}`}>
                      <div className="flex justify-between font-medium">
                        <span>Gross Pay</span>
                        <span>{formatMoney(gross)}</span>
                      </div>
                      {isHourly && (
                        <div className={`flex justify-between text-xs ${t.subtle}`}>
                          <span>{paystubMode === "80hr" ? "80" : (avgHoursPerPeriod % 1 === 0 ? avgHoursPerPeriod : avgHoursPerPeriod.toFixed(1))} hrs × ${data.hourlyRate}/hr</span>
                        </div>
                      )}
                      <div className={`flex justify-between text-xs ${t.subtle}`}>
                        <span>− Standard deduction (${(results.federalStandardDeduction / n).toFixed(0)}/check)</span>
                        <span>= {formatMoney(gross - results.federalStandardDeduction / n)} federal taxable</span>
                      </div>
                    </div>

                    {/* Taxes */}
                    <div className={`px-3 py-2 space-y-1.5 border-b ${t.border}`}>
                      <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Taxes Withheld</p>
                      {taxes.map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <span className={t.muted}>{label}</span>
                          <span className="text-red-400">−{formatMoney(value)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pre-tax deductions */}
                    {deductions.length > 0 && (
                      <div className={`px-3 py-2 space-y-1.5 border-b ${t.border}`}>
                        <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Pre-Tax Deductions</p>
                        {deductions.map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className={t.muted}>{label}</span>
                            <span className="text-red-400">−{formatMoney(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Net */}
                    <div className="px-3 py-2 flex justify-between font-bold">
                      <span>Net Pay</span>
                      <span className="text-emerald-400">{formatMoney(netPay)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

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