import { useState } from "react"
import IncomeAndTaxes from "./components/IncomeAndTaxes"
import MonthlyExpenses from "./components/MonthlyExpenses"
import Subscriptions from "./components/Subscriptions"
import SavingsGoals from "./components/SavingsGoals"
import Dashboard from "./components/Dashboard"

const STEPS = ["Income & Taxes", "Monthly Expenses", "Subscriptions", "Savings Goals", "Dashboard"]

function App() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("budgetStep")
    return saved ? Number(saved) : 0
  })

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("budgetData")
    return saved
      ? JSON.parse(saved)
      : {
          grossSalary: 0,
          retirement401k: 0,
          hsa: 0,
          healthInsurance: 0,
          dental: 0,
          vision: 0,
        }
  })

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("budgetTheme")
    return saved ? saved === "dark" : true
  })

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("budgetTheme", newTheme ? "dark" : "light")
  }

  const changeStep = (step) => {
    setCurrentStep(step)
    localStorage.setItem("budgetStep", step)
  }

  const updateData = (newData) => {
    setData(newData)
    localStorage.setItem("budgetData", JSON.stringify(newData))
  }

  const resetData = () => {
    const blank = {
      grossSalary: 0,
      retirement401k: 0,
      hsa: 0,
      healthInsurance: 0,
      dental: 0,
      vision: 0,
    }
    setData(blank)
    localStorage.removeItem("budgetData")
    setCurrentStep(0)
    localStorage.removeItem("budgetStep")
  }

  // Theme classes we reuse everywhere
const t = {
    bg: isDark ? "bg-gray-950" : "bg-gray-50",
    text: isDark ? "text-gray-100" : "text-gray-900",
    border: isDark ? "border-gray-800" : "border-gray-200",
    card: isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 shadow-sm text-gray-900",
    input: isDark
      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    muted: isDark ? "text-gray-400" : "text-gray-600",
    subtle: isDark ? "text-gray-500" : "text-gray-500",
    pill: isDark ? "bg-gray-800" : "bg-gray-100",
    heading: isDark ? "text-white" : "text-gray-900",
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IncomeAndTaxes data={data} setData={updateData} t={t} isDark={isDark} />
      case 1:
        return <MonthlyExpenses data={data} setData={updateData} t={t} isDark={isDark} />
      case 2:
        return <Subscriptions data={data} setData={updateData} t={t} isDark={isDark} />
      case 3:
        return <SavingsGoals data={data} setData={updateData} t={t} isDark={isDark} />
      case 4:
        return <Dashboard data={data} setData={updateData} t={t} isDark={isDark} />
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${t.bg} ${t.text}`}>
      <header className={`border-b px-6 py-4 flex items-center justify-between ${t.border}`}>
        <h1 className="text-2xl font-bold tracking-tight">Budget Planner</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? "bg-gray-700" : "bg-emerald-400"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs ${
                isDark ? "translate-x-0 bg-gray-900" : "translate-x-7 bg-white"
              }`}
            >
              {isDark ? "🌙" : "☀️"}
            </span>
          </button>
          <button
            onClick={resetData}
            className={`text-sm ${t.subtle} hover:text-red-400 transition-colors`}
          >
            Reset All
          </button>
        </div>
      </header>

      <nav className={`px-4 py-3 flex gap-1.5 border-b overflow-x-auto ${t.border}`}>
        {STEPS.map((step, index) => (
          <button
            key={step}
            onClick={() => changeStep(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              index === currentStep
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">{step}</span>
            <span className="sm:hidden">{["Income", "Expenses", "Subs", "Savings", "Summary"][index]}</span>
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {renderStep()}
      </main>
    </div>
  )
}

export default App