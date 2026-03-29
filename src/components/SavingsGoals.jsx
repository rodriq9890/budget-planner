import IncomeBar from "./IncomeBar"
function SavingsGoals({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value })
  }

  const extraGoals = data.extraGoals || [{ id: 1, name: "", amount: 0 }]

  const updateGoal = (id, field, value) => {
    const updated = extraGoals.map((g) =>
      g.id === id ? { ...g, [field]: value } : g
    )
    setData({ ...data, extraGoals: updated })
  }

  const addGoal = () => {
    const newId = Math.max(...extraGoals.map((g) => g.id), 0) + 1
    setData({ ...data, extraGoals: [...extraGoals, { id: newId, name: "", amount: 0 }] })
  }

  const removeGoal = (id) => {
    setData({ ...data, extraGoals: extraGoals.filter((g) => g.id !== id) })
  }

  // Calculate emergency fund
  const expenses = data.monthlyExpenses || []
  const monthlyEssentials = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const monthsCoverage = data.emergencyMonths || 0
  const emergencyTarget = monthlyEssentials * monthsCoverage
  const currentSavings = data.currentSavings || 0
  const hysaApy = data.hysaApy || 0
  const monthlyDeposit = data.monthlyEmergencyDeposit || 0

  // Project growth month by month
  const projection = []
  let balance = currentSavings
  const monthlyRate = hysaApy / 100 / 12
  let goalReachedMonth = null

  for (let i = 1; i <= 36; i++) {
    const interest = balance * monthlyRate
    balance += monthlyDeposit + interest
    const month = new Date()
    month.setMonth(month.getMonth() + i)

    if (balance >= emergencyTarget && goalReachedMonth === null && emergencyTarget > 0) {
      goalReachedMonth = i
    }

    projection.push({
      month: i,
      label: month.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      balance,
      interest,
    })
  }

  const extraGoalsTotal = extraGoals.reduce((sum, g) => sum + (g.amount || 0), 0)
  const totalMonthlySaving = monthlyDeposit + extraGoalsTotal

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  // Bar chart - find max for scaling
  const maxBalance = Math.max(...projection.map((p) => p.balance), emergencyTarget, 1)

   return (
        <div>
        <IncomeBar data={data} />
        <div className="space-y-10">
        <div>
            <h2 className="text-xl font-semibold text-white mb-1">Savings Goals</h2>
            <p className="text-gray-500 text-sm">
            Plan your emergency fund and other savings goals.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                Emergency Fund
                </h3>

                <label className="block">
                <span className="text-sm text-gray-400">Months of expenses to cover</span>
                <input
                    type="number"
                    value={data.emergencyMonths || ""}
                    onChange={(e) => handleChange("emergencyMonths", Number(e.target.value))}
                    placeholder="6"
                    className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                </label>

                {monthlyEssentials > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm">
                    <span className="text-gray-400">Your monthly essentials: </span>
                    <span className="text-white font-medium">{formatMoney(monthlyEssentials)}</span>
                    <span className="text-gray-400"> × {monthsCoverage} months = </span>
                    <span className="text-emerald-400 font-medium">{formatMoney(emergencyTarget)} target</span>
                </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm text-gray-400">Currently saved</span>
                    <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                        type="number"
                        value={data.currentSavings || ""}
                        onChange={(e) => handleChange("currentSavings", Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    </div>
                </label>

                <label className="block">
                    <span className="text-sm text-gray-400">HYSA APY (%)</span>
                    <div className="relative mt-1">
                    <input
                        type="number"
                        step="0.1"
                        value={data.hysaApy || ""}
                        onChange={(e) => handleChange("hysaApy", Number(e.target.value))}
                        placeholder="3.3"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                </label>
                </div>

                <label className="block">
                <span className="text-sm text-gray-400">Monthly deposit toward emergency fund</span>
                <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                    type="number"
                    value={data.monthlyEmergencyDeposit || ""}
                    onChange={(e) => handleChange("monthlyEmergencyDeposit", Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                </div>
                </label>
            </div>

            {/* Extra goals */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                Other Savings Goals
                </h3>
                <p className="text-gray-500 text-xs">Travel, PC build, etc. — monthly amount you set aside.</p>

                <div className="space-y-3">
                {extraGoals.map((goal) => (
                    <div key={goal.id} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={goal.name}
                        onChange={(e) => updateGoal(goal.id, "name", e.target.value)}
                        placeholder="Goal name"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                        type="number"
                        value={goal.amount || ""}
                        onChange={(e) => updateGoal(goal.id, "amount", Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                    <span className="text-xs text-gray-600 w-8">/mo</span>
                    <button
                        onClick={() => removeGoal(goal.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                        ✕
                    </button>
                    </div>
                ))}
                </div>

                <button
                onClick={addGoal}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                + Add savings goal
                </button>
            </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8 space-y-6">
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                Savings Summary
                </h3>

                <div>
                <p className="text-3xl font-bold text-white">{formatMoney(totalMonthlySaving)}</p>
                <p className="text-sm text-gray-500">total saved per month</p>
                </div>

                {emergencyTarget > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Emergency fund target</span>
                    <span className="text-white">{formatMoney(emergencyTarget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Currently saved</span>
                    <span className="text-white">{formatMoney(currentSavings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-emerald-400">
                        {formatMoney(Math.max(0, emergencyTarget - currentSavings))}
                    </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{
                        width: `${Math.min(100, (currentSavings / emergencyTarget) * 100)}%`,
                        }}
                    />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                    {((currentSavings / emergencyTarget) * 100).toFixed(0)}% funded
                    </p>

                    {goalReachedMonth && (
                    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3 text-center mt-2">
                        <p className="text-sm text-emerald-400">
                        Goal reached in ~{goalReachedMonth} months
                        </p>
                        <p className="text-xs text-gray-500">
                        ({projection[goalReachedMonth - 1]?.label})
                        </p>
                    </div>
                    )}
                </div>
                )}

                {extraGoals.filter((g) => g.amount > 0).length > 0 && (
                <div className="border-t border-gray-800 pt-4 space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Other Goals
                    </h4>
                    {extraGoals
                    .filter((g) => g.amount > 0)
                    .map((g) => (
                        <div key={g.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{g.name || "Unnamed"}</span>
                        <span className="text-white">{formatMoney(g.amount)}/mo</span>
                        </div>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Projection chart */}
        {monthlyDeposit > 0 && (
            <div className="space-y-4">
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                Emergency Fund Projection (36 months)
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-end gap-1 h-48">
                {projection
                    .filter((_, i) => i % 2 === 0)
                    .map((p) => (
                    <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col justify-end h-36">
                        <div
                            className={`w-full rounded-sm transition-all duration-300 ${
                            p.balance >= emergencyTarget ? "bg-emerald-500" : "bg-gray-600"
                            }`}
                            style={{
                            height: `${(p.balance / maxBalance) * 100}%`,
                            minHeight: "2px",
                            }}
                        />
                        </div>
                        <span className="text-[10px] text-gray-600 rotate-45 origin-left">
                        {p.label}
                        </span>
                    </div>
                    ))}
                </div>

                {/* Target line label */}
                {emergencyTarget > 0 && (
                <div className="flex items-center gap-2 mt-4 text-xs">
                    <div className="w-4 h-0.5 bg-emerald-500" />
                    <span className="text-gray-400">
                    Target: {formatMoney(emergencyTarget)}
                    </span>
                    <div className="w-4 h-0.5 bg-gray-600" />
                    <span className="text-gray-400">Below target</span>
                </div>
                )}
            </div>
            </div>
        )}
        </div>
    </div>
  )
}

export default SavingsGoals