/**
 * Shared UI primitives — Coaching ERP
 */

/* ── PageHeader ─────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

/* ── StatCard ────────────────────────────────────────────── */
const colorCfg = {
  blue:   { icon: "bg-indigo-50 text-indigo-600",   val: "text-indigo-600" },
  green:  { icon: "bg-emerald-50 text-emerald-600", val: "text-emerald-600" },
  yellow: { icon: "bg-amber-50 text-amber-600",     val: "text-amber-600" },
  red:    { icon: "bg-red-50 text-red-600",          val: "text-red-600" },
  purple: { icon: "bg-purple-50 text-purple-600",    val: "text-purple-600" },
  slate:  { icon: "bg-slate-100 text-slate-500",     val: "text-slate-600" },
}

export function StatCard({ label, value, icon, color = "blue", sub }) {
  const cfg = colorCfg[color] ?? colorCfg.blue
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-panel transition-shadow duration-200">
      {icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${cfg.icon}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">{label}</p>
        <p className={`text-2xl font-bold mt-1 leading-none ${cfg.val}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

/* ── EmptyState ──────────────────────────────────────────── */
export function EmptyState({ icon = "📭", title = "No data found", subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div>
        <p className="text-slate-700 font-semibold">{title}</p>
        {subtitle && <p className="text-slate-400 text-sm mt-1 max-w-xs">{subtitle}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = "md", className = "" }) {
  const sz = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-8 h-8" }[size] ?? "w-5 h-5"
  return (
    <div className={`${sz} border-2 border-primary-500 border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center gap-3 text-slate-400 py-16 justify-center">
      <Spinner size="lg" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

/* ── Alert ───────────────────────────────────────────────── */
const alertStyles = {
  error:   "bg-red-50 border-red-100 text-red-700",
  success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  warning: "bg-amber-50 border-amber-100 text-amber-700",
  info:    "bg-indigo-50 border-indigo-100 text-indigo-700",
}
const alertIcons = {
  error:   "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  info:    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
}

export function Alert({ type = "error", message, onClose }) {
  if (!message) return null
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-sm ${alertStyles[type] ?? alertStyles.info}`}>
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={alertIcons[type] ?? alertIcons.info} />
      </svg>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-50 hover:opacity-100 transition text-lg leading-none">&times;</button>
      )}
    </div>
  )
}

/* ── SectionCard ─────────────────────────────────────────── */
export function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ── TableWrapper ────────────────────────────────────────── */
export function TableWrapper({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-100 ${className}`}>
      {children}
    </div>
  )
}

/* ── ConfirmPopover ──────────────────────────────────────── */
export function ConfirmPopover({ message = "Are you sure?", onConfirm, onCancel }) {
  return (
    <div className="absolute z-50 right-0 top-9 w-64 bg-white border border-slate-100 rounded-2xl shadow-panel p-4">
      <p className="text-sm text-slate-700 mb-4 leading-relaxed">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
        <button onClick={onConfirm} className="btn-danger text-xs px-3 py-1.5">Delete</button>
      </div>
    </div>
  )
}

/* ── TabBar ──────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl w-fit flex-wrap">
      {tabs.map((tab) => {
        const key   = typeof tab === "string" ? tab : tab.key
        const label = typeof tab === "string" ? tab : tab.label
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
              ${active === key
                ? "bg-white text-primary-700 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
              }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ── SearchBar ───────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="inp pl-10"
      />
    </div>
  )
}

/* ── PaginationBar ───────────────────────────────────────── */
export function PaginationBar({ page, total, pageSize, onChange, className = "" }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - delta && p <= page + delta)) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…")
    }
  }

  const btn = "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"

  return (
    <div className={`flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/80 ${className}`}>
      <span className="text-xs text-slate-400">
        {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onChange(1)} disabled={page === 1}
          className={`${btn} text-slate-400 hover:bg-slate-200 disabled:opacity-30`}>«</button>
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={`${btn} text-slate-400 hover:bg-slate-200 disabled:opacity-30`}>‹</button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-xs text-slate-300">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p)}
              className={`${btn} ${p === page ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className={`${btn} text-slate-400 hover:bg-slate-200 disabled:opacity-30`}>›</button>
        <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
          className={`${btn} text-slate-400 hover:bg-slate-200 disabled:opacity-30`}>»</button>
      </div>
    </div>
  )
}
