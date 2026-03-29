import { useState } from "react"
import IncomeBar from "./IncomeBar"

const DEFAULT_EXPENSES = [
  { id: 1, name: "Rent", amount: 0 },
  { id: 2, name: "Utilities", amount: 0 },
  { id: 3, name: "WiFi", amount: 0 },
  { id: 4, name: "Gym", amount: 0 },
  { id: 5, name: "Phone Bill", amount: 0 },
]

function MonthlyExpenses({ data, setData }) {
  const expenses = data.monthlyExpenses || DEFAULT_EXPENSES

  const updateExpense = (id, field, value) => {
    const updated = expenses.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    setData({ ...data, monthlyExpenses: updated })
  }

  const addExpense = () => {
    const newId = Math.max(...expenses.map((e) => e.id), 0) + 1
    setData({
      ...data,
      monthlyExpenses: [...expenses, { id: newId, name: "", amount: 0 }],
    })
  }

  const removeExpense = (id) => {
    setData({
      ...data,
      monthlyExpenses: expenses.filter((exp) => exp.id !== id),
    })
  }

  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      <IncomeBar data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left side — Inputs */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Monthly Expenses</h2>
            <p className="text-gray-500 text-sm">
              Fixed costs you pay every month. These are your "needs."
            </p>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, "name", e.target.value)}
                  placeholder="Expense name"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={expense.amount || ""}
                    onChange={(e) =>
                      updateExpense(expense.id, "amount", Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addExpense}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            + Add expense
          </button>
        </div>

        {/* Right side — Summary */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8 space-y-6">
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              Essentials Summary
            </h3>

            <div>
              <p className="text-3xl font-bold text-white">{formatMoney(total)}</p>
              <p className="text-sm text-gray-500">per month</p>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">{formatMoney(total * 12)}</p>
              <p className="text-xs text-gray-500">per year</p>
            </div>

            {/* Individual breakdown */}
            <div className="border-t border-gray-800 pt-4 space-y-2">
              {expenses
                .filter((e) => e.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .map((expense) => (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{expense.name || "Unnamed"}</span>
                    <span className="text-white">{formatMoney(expense.amount)}</span>
                  </div>
                ))}
            </div>

            {/* Percentage of income */}
            {data.grossSalary > 0 && (
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">% of Gross Income</p>
                <p className="text-xl font-bold text-white">
                  {(((total * 12) / data.grossSalary) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyExpenses