import MonthlyExpenses from "./components/MonthlyExpenses"
import Subscriptions from "./components/Subscriptions"
import { useState } from "react"
import IncomeAndTaxes from "./components/IncomeAndTaxes"

const STEPS = ["Income & Taxes", "Monthly Expenses", "Subscriptions", "Savings Goals", "Dashboard"]

function App() {
  const [currentStep, setCurrentStep] = useState(() => {
  const saved = localStorage.getItem("budgetStep")
  return saved ? Number(saved) : 0
})

const changeStep = (step) => {
  setCurrentStep(step)
  localStorage.setItem("budgetStep", step)
}
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
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IncomeAndTaxes data={data} setData={updateData} />
      case 1:
        return <MonthlyExpenses data={data} setData={updateData} />
      case 2:
        return <Subscriptions data={data} setData={updateData} />
      case 3:
        return <p className="text-gray-500">Savings Goals — coming soon</p>
      case 4:
        return <p className="text-gray-500">Dashboard — coming soon</p>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Budget Planner</h1>
        <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Budget Planner</h1>
          <button
            onClick={resetData}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Reset All
          </button>
        </header>        
      </header>

      <nav className="px-6 py-4 flex gap-2 border-b border-gray-800">
        {STEPS.map((step, index) => (
          <button
            key={step}
            onClick={() => changeStep(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              index === currentStep
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {step}
          </button>
        ))}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {renderStep()}
      </main>
    </div>
  )
}

export default App