import { useState } from "react"
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from "../utils/firebase"

function AuthModal({ onClose, t, isDark }) {
  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    let result
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name")
        setLoading(false)
        return
      }
      result = await signUpWithEmail(email, password, name)
    } else {
      result = await signInWithEmail(email, password)
    }

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  const handleGoogle = async () => {
    setError("")
    setLoading(true)
    const result = await signInWithGoogle()
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  const handleReset = async () => {
    if (!email) {
      setError("Enter your email address first")
      return
    }
    setError("")
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setResetSent(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className={`relative w-full max-w-sm rounded-2xl border p-6 space-y-5 ${t.card}`}>
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className={`text-sm mt-1 ${t.subtle}`}>
            {mode === "signin"
              ? "Sign in to sync your budget across devices"
              : "Create an account to save your budget"}
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors ${
            isDark
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <span className={`text-xs ${t.subtle}`}>or</span>
          <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>

        {/* Email form */}
        <div className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your name"
              className={`w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Email address"
            className={`w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className={`w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        {mode === "signin" && !resetSent && (
          <button
            onClick={handleReset}
            className="w-full text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Forgot password?
          </button>
        )}

      {resetSent && (
        <p className="text-emerald-400 text-sm text-center">
          Password reset email sent! Check your inbox.
        </p>
      )}

        <p className={`text-center text-sm ${t.subtle}`}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError("") }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal