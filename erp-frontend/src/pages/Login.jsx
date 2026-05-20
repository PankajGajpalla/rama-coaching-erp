import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginAPI } from "../api"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]               = useState({ username: "", password: "" })
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required")
      return
    }
    setLoading(true)
    try {
      const res  = await loginAPI(form)
      const user = login(res.data.access_token)
      if (user?.role === "teacher")      navigate("/teacher")
      else if (user?.role === "student") navigate("/student/dashboard")
      else if (user?.role === "staff")   navigate("/staff/dashboard")
      else if (user?.role === "parent")  navigate("/parent/dashboard")
      else                               navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow mb-3">
            <img src="/rama_logo.jpeg" alt="RAMA Coaching" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">RAMA Coaching</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              className="inp"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="inp pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-base mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </>
            ) : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  )
}
