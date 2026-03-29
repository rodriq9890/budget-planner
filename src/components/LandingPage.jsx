function LandingPage({ onGetStarted, onSignIn, onToggleTheme, t, isDark }) {
  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Nav */}
      <nav className={`px-6 py-4 flex items-center justify-between border-b ${t.border}`}>
        <h1 className={`text-xl font-bold tracking-tight ${t.heading}`}>Budget Planner</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
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
            onClick={onSignIn}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 mb-6">
          Free • No credit card required
        </div>
        <h2 className={`text-4xl sm:text-5xl font-bold leading-tight mb-6 ${t.heading}`}>
          Take control of your
          <span className="text-emerald-400"> finances</span>
        </h2>
        <p className={`text-lg max-w-2xl mx-auto mb-10 ${t.muted}`}>
          Calculate your real take-home pay, plan your budget with the 50/30/20 rule,
          and track your savings goals — all in one place. Works for all 50 states.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
          >
            Get Started
          </button>
          <button
            onClick={onSignIn}
            className={`px-8 py-3 rounded-xl font-medium border transition-colors ${
              isDark ? "border-gray-700 text-white hover:bg-gray-800" : "border-gray-300 text-gray-900 hover:bg-gray-100"
            }`}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "💰",
              title: "Smart Tax Calculator",
              description: "Accurate federal, state, and city tax calculations for all 50 states. Just enter your zip code.",
            },
            {
              icon: "📊",
              title: "50/30/20 Budget",
              description: "See exactly how your money splits between needs, wants, and savings with interactive charts.",
            },
            {
              icon: "🏦",
              title: "Emergency Fund Tracker",
              description: "Set your savings target, track your progress, and project when you'll reach your goal.",
            },
            {
              icon: "📱",
              title: "Sync Across Devices",
              description: "Sign in with Google or email and your budget stays in sync on every device.",
            },
            {
              icon: "📄",
              title: "Export to PDF & Excel",
              description: "Download your complete budget breakdown as a professional PDF or editable spreadsheet.",
            },
            {
              icon: "🌙",
              title: "Dark & Light Mode",
              description: "Easy on the eyes, day or night. Toggle between themes with one click.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`border rounded-xl p-6 space-y-3 transition-colors ${t.card} ${
                isDark ? "hover:border-gray-700" : "hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className={`text-sm ${t.muted}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className={`border-t py-20 ${t.border}`}>
        <div className="max-w-4xl mx-auto px-6">
          <h3 className={`text-2xl font-bold text-center mb-12 ${t.heading}`}>How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Enter your salary", description: "Tell us your gross income and location" },
              { step: "2", title: "Add your expenses", description: "Rent, bills, subscriptions — everything" },
              { step: "3", title: "Set savings goals", description: "Emergency fund, travel, investments" },
              { step: "4", title: "See your plan", description: "Get a complete budget breakdown" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h4 className={`font-semibold ${t.heading}`}>{item.title}</h4>
                <p className={`text-sm ${t.muted}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h3 className={`text-2xl font-bold mb-4 ${t.heading}`}>Ready to take control?</h3>
        <p className={`mb-8 ${t.muted}`}>
          Join thousands of people who budget smarter. It's free.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          Start Planning
        </button>
      </div>

      {/* Footer */}
      <footer className={`border-t px-6 py-6 text-center text-sm ${t.border} ${t.subtle}`}>
        Built with React + Firebase • © {new Date().getFullYear()} Budget Planner
      </footer>
    </div>
  )
}

export default LandingPage