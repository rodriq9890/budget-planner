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

  // Cycle: true (fixed) → "variable" → false (non-essential) → true
  const cycleEssential = (current) => {
    if (current === "variable") return false
    if (current === false) return true
    return "variable"
  }

  const essentialIcon = (essential) =>
    essential === false ? "✦" : essential === "variable" ? "🧾" : "🛡️"

  const essentialTitle = (essential) =>
    essential === false
      ? "Non-essential — excluded from emergency fund"
      : essential === "variable"
      ? "Variable essential — included in emergency fund, shown as Variable Budget in income bar"
      : "Fixed essential — included in emergency fund, counted as Fixed Expenses in income bar"

  const essentialOpacity = (essential) =>
    essential === false ? "opacity-30" : ""

  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const fixedTotal = expenses
    .filter((e) => e.essential === true || (e.essential !== false && e.essential !== "variable"))
    .reduce((sum, e) => sum + (e.amount || 0), 0)
  const variableTotal = expenses
    .filter((e) => e.essential === "variable")
    .reduce((sum, e) => sum + (e.amount || 0), 0)
  const nonEssentialTotal = expenses
    .filter((e) => e.essential === false)
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
            <div className={`mt-3 flex flex-col gap-1 text-xs ${t.muted}`}>
              <span>🛡️ <strong>Fixed essential</strong> — counted in emergency fund · shown as Fixed Expenses</span>
              <span>🧾 <strong>Variable essential</strong> — counted in emergency fund · shown as Variable Budget (food, gas, etc.)</span>
              <span className="opacity-50">✦ <strong>Non-essential</strong> — excluded from emergency fund · shown as Expenses</span>
              <span className={`${t.subtle} mt-0.5`}>Click the icon on each row to cycle through types.</span>
            </div>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex gap-3 items-center">
                <button
                  onClick={() => updateExpense(expense.id, "essential", cycleEssential(expense.essential))}
                  title={essentialTitle(expense.essential)}
                  className={`text-lg shrink-0 transition-opacity ${essentialOpacity(expense.essential)}`}
                >
                  {essentialIcon(expense.essential)}
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
              Expenses Summary
            </h3>

            <div>
              <p className="text-3xl font-bold">{formatMoney(total)}</p>
              <p className={`text-sm ${t.subtle}`}>per month (total)</p>
            </div>

            <div className="space-y-2 text-sm">
              {fixedTotal > 0 && (
                <div className="flex justify-between">
                  <span className={t.muted}>🛡️ Fixed essential</span>
                  <span className="font-medium">{formatMoney(fixedTotal)}</span>
                </div>
              )}
              {variableTotal > 0 && (
                <div className="flex justify-between">
                  <span className={t.muted}>🧾 Variable essential</span>
                  <span className="font-medium">{formatMoney(variableTotal)}</span>
                </div>
              )}
              {nonEssentialTotal > 0 && (
                <div className="flex justify-between">
                  <span className={`opacity-60 ${t.muted}`}>✦ Non-essential</span>
                  <span className="font-medium opacity-60">{formatMoney(nonEssentialTotal)}</span>
                </div>
              )}
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
                    <span className={t.muted}>
                      {essentialIcon(expense.essential)} {expense.name || "Unnamed"}
                    </span>
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
