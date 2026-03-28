import { useState } from "react"
import { calculateTaxBreakdown } from "../utils/taxCalculator"

function IncomeAndTaxes({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value })
  }

  const results = calculateTaxBreakdown(data)

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
      {/* Left side — Inputs */}
      <div className="lg:col-span-3 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Income & Taxes</h2>
          <p className="text-gray-500 text-sm">Enter your gross salary and pre-tax deductions.</p>
        </div>

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

      {/* Right side — Live Results */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8 space-y-6">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Take-Home Pay</h3>

          {/* Big number */}
          <div>
            <p className="text-3xl font-bold text-white">{formatMoney(results.monthlyNet)}</p>
            <p className="text-sm text-gray-500">per month</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-semibold text-white">{formatMoney(results.biweeklyNet)}</p>
              <p className="text-xs text-gray-500">per paycheck</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{formatMoney(results.annualNet)}</p>
              <p className="text-xs text-gray-500">per year</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax Breakdown (Annual)</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Federal</span>
                <span className="text-white">{formatMoney(results.federalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NY State</span>
                <span className="text-white">{formatMoney(results.nyStateTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NYC City</span>
                <span className="text-white">{formatMoney(results.nycTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Social Security</span>
                <span className="text-white">{formatMoney(results.socialSecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Medicare</span>
                <span className="text-white">{formatMoney(results.medicare)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-2 font-medium">
                <span className="text-gray-300">Total Tax</span>
                <span className="text-red-400">{formatMoney(results.totalTax)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pre-Tax Deductions (Annual)</h4>
            <div className="flex justify-between">
              <span className="text-gray-400">401k + Benefits</span>
              <span className="text-white">{formatMoney(results.preTaxDeductions)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-2 font-medium">
              <span className="text-gray-300">Total Deductions</span>
              <span className="text-red-400">{formatMoney(results.totalDeductions)}</span>
            </div>
          </div>

          {/* Effective rate */}
          {results.gross > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">Effective Tax Rate</p>
              <p className="text-xl font-bold text-white">
                {((results.totalTax / results.gross) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncomeAndTaxes