import IncomeBar from "./IncomeBar"

function MonthlyExpenses({ data, setData, t, isDark }) {
  const expenses = data.monthlyExpenses || [
    { id: 1, name: "Rent", amount: 0 },
    { id: 2, name: "Utilities", amount: 0 },
    { id: 3, name: "WiFi", amount: 0 },
    { id: 4, name: "Gym", amount: 0 },
    { id: 5, name: "Phone Bill", amount: 0 },
  ]

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
      monthlyExpenses: [...expenses, { id: newId, name: "", amount: 0, essential: true }],
    })
  }

  const removeExpense = (id) => {
    setData({
      ...data,
      monthlyExpenses: expenses.filter((exp) => exp.id !== id),
    })
  }

  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  
  const essentialTotal = expenses
    .filter((e) => e.essential !== false)
    .reduce((sum, e) => sum + (e.amount || 0), 0)

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
      <IncomeBar data={data} t={t} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-1">Monthly Expenses</h2>
            <p className={`${t.subtle} text-sm`}>
              Fixed costs you pay every month. These are your "needs."
            </p>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex gap-3 items-center">
                <button
                  onClick={() => updateExpense(expense.id, "essential", !expense.essential)}
                  title={expense.essential !== false ? "Essential — counted in emergency fund" : "Non-essential — excluded from emergency fund"}
                  className={`text-lg shrink-0 ${expense.essential !== false ? "" : "opacity-30"}`}
                >
                  {expense.essential !== false ? "🛡️" : "✦"}
                </button>
                <input
                  type="text"
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, "name", e.target.value)}
                  placeholder="Expense name"
                  className={`flex-1 rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
                />
                <div className="relative w-36">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtle}`}>$</span>
                  <input
                    type="number"
                    value={expense.amount || ""}
                    onChange={(e) =>
                      updateExpense(expense.id, "amount", Number(e.target.value))
                    }
                    placeholder="0"
                    className={`w-full rounded-lg pl-8 pr-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
                  />
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className={`${t.subtle} hover:text-red-400 transition-colors p-1`}
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

        <div className="lg:col-span-2">
          <div className={`border rounded-xl p-6 sticky top-8 space-y-6 ${t.card}`}>
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              Essentials Summary
            </h3>

            <div>
              <p className="text-3xl font-bold">{formatMoney(total)}</p>
              <p className={`text-sm ${t.subtle}`}>per month (total)</p>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="font-semibold">{formatMoney(essentialTotal)}</p>
                <p className={`text-xs ${t.subtle}`}>🛡️ essential</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatMoney(total - essentialTotal)}</p>
                <p className={`text-xs ${t.subtle}`}>✦ non-essential</p>
              </div>
            </div>

            <div>
              <p className="text-lg font-semibold">{formatMoney(total * 12)}</p>
              <p className={`text-xs ${t.subtle}`}>per year</p>
            </div>

            <div className={`border-t pt-4 space-y-2 ${t.border}`}>
              {expenses
                .filter((e) => e.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .map((expense) => (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span className={t.muted}>{expense.name || "Unnamed"}</span>
                    <span>{formatMoney(expense.amount)}</span>
                  </div>
                ))}
            </div>

            {data.grossSalary > 0 && (
              <div className={`rounded-lg p-3 text-center ${t.pill}`}>
                <p className={`text-sm ${t.muted}`}>% of Gross Income</p>
                <p className="text-xl font-bold">
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