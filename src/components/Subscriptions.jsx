function Subscriptions({ data, setData }) {
  const monthlySubs = data.monthlySubs || [
    { id: 1, name: "", amount: 0 },
  ]
  const annualSubs = data.annualSubs || [
    { id: 1, name: "", amount: 0 },
  ]

  const updateList = (key, list, id, field, value) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    )
    setData({ ...data, [key]: updated })
  }

  const addItem = (key, list) => {
    const newId = Math.max(...list.map((i) => i.id), 0) + 1
    setData({ ...data, [key]: [...list, { id: newId, name: "", amount: 0 }] })
  }

  const removeItem = (key, list, id) => {
    setData({ ...data, [key]: list.filter((item) => item.id !== id) })
  }

  const monthlyTotal = monthlySubs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const annualTotal = annualSubs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const annualAsMonthly = annualTotal / 12
  const grandTotal = monthlyTotal + annualAsMonthly

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)

  const renderList = (key, list, label, amountLabel) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">{label}</h3>
      <div className="space-y-3">
        {list.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateList(key, list, item.id, "name", e.target.value)}
              placeholder="Name"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={item.amount || ""}
                onChange={(e) =>
                  updateList(key, list, item.id, "amount", Number(e.target.value))
                }
                placeholder="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-gray-600 w-8">{amountLabel}</span>
            <button
              onClick={() => removeItem(key, list, item.id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addItem(key, list)}
        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        + Add {label.toLowerCase().includes("annual") ? "annual" : "monthly"} subscription
      </button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Subscriptions & Memberships</h2>
          <p className="text-gray-500 text-sm">
            Monthly subscriptions and annual fees. Annual costs are converted to monthly automatically.
          </p>
        </div>

        {renderList("monthlySubs", monthlySubs, "Monthly Subscriptions", "/mo")}
        {renderList("annualSubs", annualSubs, "Annual Subscriptions & Card Fees", "/yr")}
      </div>

      {/* Right side — Summary */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8 space-y-6">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
            Subscriptions Summary
          </h3>

          <div>
            <p className="text-3xl font-bold text-white">{formatMoney(grandTotal)}</p>
            <p className="text-sm text-gray-500">per month (total)</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">{formatMoney(grandTotal * 12)}</p>
            <p className="text-xs text-gray-500">per year</p>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-4">
            {/* Monthly breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly</h4>
              {monthlySubs
                .filter((s) => s.amount > 0)
                .map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{s.name || "Unnamed"}</span>
                    <span className="text-white">{formatMoney(s.amount)}/mo</span>
                  </div>
                ))}
              {monthlyTotal > 0 && (
                <div className="flex justify-between text-sm font-medium border-t border-gray-800 pt-2">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">{formatMoney(monthlyTotal)}/mo</span>
                </div>
              )}
            </div>

            {/* Annual breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Annual (as monthly)</h4>
              {annualSubs
                .filter((s) => s.amount > 0)
                .map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{s.name || "Unnamed"}</span>
                    <span className="text-white">
                      {formatMoney(s.amount / 12)}/mo
                      <span className="text-gray-600 ml-1">({formatMoney(s.amount)}/yr)</span>
                    </span>
                  </div>
                ))}
              {annualTotal > 0 && (
                <div className="flex justify-between text-sm font-medium border-t border-gray-800 pt-2">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">{formatMoney(annualAsMonthly)}/mo</span>
                </div>
              )}
            </div>
          </div>

          {data.grossSalary > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">% of Gross Income</p>
              <p className="text-xl font-bold text-white">
                {(((grandTotal * 12) / data.grossSalary) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Subscriptions