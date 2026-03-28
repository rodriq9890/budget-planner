import { useState } from "react"

function IncomeAndTaxes({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Income & Taxes</h2>
        <p className="text-gray-500 text-sm">Enter your gross salary and pre-tax deductions.</p>
      </div>

      {/* Gross Salary */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Income</h3>
        <label className="block">
          <span className="text-sm text-gray-400">Annual Gross Salary</span>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.grossSalary || ""}
              onChange={(e) => handleChange("grossSalary", Number(e.target.value))}
              placeholder="0"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </label>
      </div>

      {/* Pre-Tax Deductions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Pre-Tax Deductions</h3>

        <label className="block">
          <span className="text-sm text-gray-400">401k Contribution (%)</span>
          <div className="relative mt-1">
            <input
              type="number"
              value={data.retirement401k || ""}
              onChange={(e) => handleChange("retirement401k", Number(e.target.value))}
              placeholder="6"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-400">HSA (per month)</span>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.hsa || ""}
                onChange={(e) => handleChange("hsa", Number(e.target.value))}
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-400">Health Insurance (per month)</span>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.healthInsurance || ""}
                onChange={(e) => handleChange("healthInsurance", Number(e.target.value))}
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-400">Dental (per month)</span>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.dental || ""}
                onChange={(e) => handleChange("dental", Number(e.target.value))}
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-400">Vision (per month)</span>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.vision || ""}
                onChange={(e) => handleChange("vision", Number(e.target.value))}
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default IncomeAndTaxes