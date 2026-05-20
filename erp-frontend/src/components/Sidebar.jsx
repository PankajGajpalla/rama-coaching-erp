import { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getNoticesAPI } from "../api"

// ── SVG icon paths (Heroicons outline) ──────────────────────────
const P = {
  home:      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  users:     "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  book:      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  chartBar:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  rupee:     "M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z",
  cap:       "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  star:      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  megaphone: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  upload:    "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  shield:    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  chat:      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  download:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  bell:      "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:      "M4 6h16M4 12h16M4 18h16",
  close:     "M6 18L18 6M6 6l12 12",
  chevLeft:  "M15 19l-7-7 7-7",
  chevRight: "M9 5l7 7-7 7",
}

function Icon({ name, className = "w-[18px] h-[18px] flex-shrink-0" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={P[name]} />
    </svg>
  )
}

// ── Nav link definitions ─────────────────────────────────────────
const adminLinks = [
  { to: "/dashboard",          label: "Dashboard",        icon: "home" },
  { to: "/students",           label: "Students",          icon: "users" },
  { to: "/courses",            label: "Courses",           icon: "book" },
  { to: "/attendance",         label: "Attendance",        icon: "clipboard" },
  { to: "/attendance-report",  label: "Att. Report",       icon: "chartBar" },
  { to: "/fees",               label: "Fees",              icon: "rupee" },
  { to: "/teachers",           label: "Teachers",          icon: "cap" },
  { to: "/grades",             label: "Grades",            icon: "star" },
  { to: "/timetable",          label: "Timetable",         icon: "calendar" },
  { to: "/notices",            label: "Notices",           icon: "megaphone", isNotices: true },
  { to: "/exam-schedule",      label: "Exam Schedule",     icon: "calendar" },
  { to: "/import",             label: "Import Students",   icon: "upload" },
  { to: "/parents",            label: "Parents",            icon: "users" },
  { to: "/admin-accounts",     label: "Admin Accounts",    icon: "shield" },
  { to: "/grievances",         label: "Grievances",        icon: "chat" },
  { to: "/audit-log",          label: "Audit Log",         icon: "search" },
  { to: "/data-export",        label: "Data Export",       icon: "download" },
]

const studentLinks = [
  { to: "/student/dashboard",    label: "My Dashboard",   icon: "home" },
  { to: "/student/attendance",   label: "Attendance",      icon: "clipboard" },
  { to: "/student/fees",         label: "Fees",            icon: "rupee" },
  { to: "/student/grades",       label: "Grades",          icon: "star" },
  { to: "/student/timetable",    label: "Timetable",       icon: "calendar" },
  { to: "/student/exam-schedule",label: "Exam Schedule",   icon: "calendar" },
  { to: "/student/notices",      label: "Notices",         icon: "megaphone", isNotices: true },
  { to: "/student/grievances",   label: "Grievances",      icon: "chat" },
]

const teacherLinks = [
  { to: "/teacher",             label: "Dashboard",        icon: "home" },
  { to: "/teacher/attendance",  label: "Attendance",       icon: "clipboard" },
  { to: "/teacher/students",    label: "My Students",      icon: "users" },
  { to: "/teacher/grades",      label: "Grades",           icon: "star" },
  { to: "/teacher/timetable",   label: "Timetable",        icon: "calendar" },
  { to: "/teacher/exam-schedule",label: "Exam Schedule",   icon: "calendar" },
  { to: "/teacher/notices",     label: "Notices",          icon: "megaphone", isNotices: true },
]

const staffLinks = [
  { to: "/staff/dashboard",         label: "Dashboard",       icon: "home" },
  { to: "/staff/students",          label: "Students",         icon: "users" },
  { to: "/staff/attendance",        label: "Attendance",       icon: "clipboard" },
  { to: "/staff/attendance-report", label: "Att. Report",      icon: "chartBar" },
  { to: "/staff/grades",            label: "Grades",           icon: "star" },
  { to: "/staff/notices",           label: "Notices",          icon: "megaphone", isNotices: true },
  { to: "/staff/timetable",         label: "Timetable",        icon: "calendar" },
  { to: "/staff/exam-schedule",     label: "Exam Schedule",    icon: "calendar" },
  { to: "/staff/import",            label: "Import Students",  icon: "upload" },
  { to: "/staff/grievances",        label: "Grievances",       icon: "chat" },
]

export default function Sidebar() {
  const { user, logout, isAdmin, isTeacher, isStaff } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [collapsed, setCollapsed]           = useState(false)
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [notices, setNotices]               = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [lastSeenCount, setLastSeenCount]   = useState(() =>
    parseInt(localStorage.getItem("erp_last_seen_notices") || "0", 10)
  )
  const notifRef       = useRef(null)
  const mobileNotifRef = useRef(null)

  useEffect(() => {
    fetchNotices()
    const interval = setInterval(() => {
      if (document.visibilityState !== "hidden") fetchNotices()
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handler(e) {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        mobileNotifRef.current && !mobileNotifRef.current.contains(e.target)
      ) setShowNotifPanel(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function fetchNotices() {
    try {
      const res = await getNoticesAPI()
      setNotices(res.data.notices || [])
    } catch { /* silent */ }
  }

  function handleBellClick() {
    setShowNotifPanel((v) => {
      if (!v) {
        setLastSeenCount(notices.length)
        localStorage.setItem("erp_last_seen_notices", String(notices.length))
      }
      return !v
    })
  }

  function goToNotices() {
    setShowNotifPanel(false)
    setMobileOpen(false)
    const path = isAdmin ? "/notices" : isTeacher ? "/teacher/notices" : isStaff ? "/staff/notices" : "/student/notices"
    navigate(path)
  }

  const unreadCount = Math.max(0, notices.length - lastSeenCount)
  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : isStaff ? staffLinks : studentLinks

  const initials = (user?.sub ?? "U").slice(0, 1).toUpperCase()
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""

  function isActive(path) {
    if (path === "/teacher")           return location.pathname === "/teacher"
    if (path === "/dashboard")         return location.pathname === "/dashboard"
    if (path === "/student/dashboard") return location.pathname === "/student/dashboard"
    if (path === "/staff/dashboard")   return location.pathname === "/staff/dashboard"
    return location.pathname.startsWith(path)
  }

  const NotifDropdown = () => (
    <div className="absolute right-0 top-11 w-76 bg-white rounded-xl shadow-panel z-50 overflow-hidden border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="font-semibold text-sm text-slate-700">Notices</span>
        <button onClick={goToNotices} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
          View all
        </button>
      </div>
      {notices.length === 0 ? (
        <div className="px-4 py-8 text-center text-slate-400 text-sm">No notices yet</div>
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
          {notices.slice(0, 10).map((n, i) => (
            <li key={n.id ?? i}
              className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer"
              onClick={goToNotices}
            >
              <p className="text-sm font-medium text-slate-800 truncate">{n.title || n.message?.slice(0, 50) || "Notice"}</p>
              {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
              {n.created_at && (
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const BellButton = () => (
    <button
      onClick={handleBellClick}
      title="Notifications"
      className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
    >
      <Icon name="bell" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )

  const NavLink = ({ link }) => {
    const active = isActive(link.to)
    return (
      <Link
        to={link.to}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? link.label : ""}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
          ${active
            ? "bg-primary-600 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
          }
          ${collapsed ? "md:justify-center md:px-0" : ""}
        `}
      >
        <Icon name={link.icon} />
        <span className={`truncate flex-1 ${collapsed ? "md:hidden" : ""}`}>
          {link.label}
        </span>
        {unreadCount > 0 && link.isNotices && !collapsed && (
          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
            {unreadCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* ── Mobile Top Bar ─────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-slate-900 flex items-center justify-between px-4 z-30 md:hidden border-b border-slate-800">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/60 transition"
        >
          <Icon name="menu" className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/rama_logo.jpeg" alt="RAMA" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
          <span className="text-white font-bold text-sm">RAMA Coaching</span>
        </div>
        <div className="relative" ref={mobileNotifRef}>
          <BellButton />
          {showNotifPanel && <NotifDropdown />}
        </div>
      </div>

      {/* ── Mobile Backdrop ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 flex flex-col
        transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
        md:static md:translate-x-0 md:z-auto md:h-screen md:sticky md:top-0
        ${collapsed ? "md:w-[68px]" : "md:w-64"}
        flex-shrink-0
      `}>

        {/* Header */}
        <div className={`flex items-center border-b border-slate-800 px-3 py-4 gap-2 ${collapsed ? "md:justify-center md:px-2" : "px-4"}`}>
          {/* Mobile close */}
          <button className="md:hidden text-slate-400 hover:text-white transition p-1" onClick={() => setMobileOpen(false)}>
            <Icon name="close" className="w-5 h-5" />
          </button>

          {/* Logo + name */}
          <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${collapsed ? "md:hidden" : ""}`}>
            <div className="w-8 h-8 bg-white rounded-lg flex-shrink-0 flex items-center justify-center">
              <img src="/rama_logo.jpeg" alt="RAMA" className="w-6 h-6 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight truncate">RAMA Coaching</p>
              <p className="text-[10px] text-slate-500 leading-tight">Coaching Management</p>
            </div>
          </div>

          {/* Collapsed: just logo */}
          <div className={`hidden ${collapsed ? "md:flex" : ""} items-center justify-center`}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img src="/rama_logo.jpeg" alt="ABS" className="w-6 h-6 object-contain" />
            </div>
          </div>

          {/* Bell + collapse — desktop */}
          <div className={`hidden md:flex items-center gap-1 flex-shrink-0 ${collapsed ? "" : ""}`}>
            {!collapsed && (
              <div className="relative" ref={notifRef}>
                <BellButton />
                {showNotifPanel && <NotifDropdown />}
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-800"
            >
              <Icon name={collapsed ? "chevRight" : "chevLeft"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className={`px-3 py-3 border-b border-slate-800/60 ${collapsed ? "md:px-2 md:flex md:justify-center" : ""}`}>
          <div className={`flex items-center gap-2.5 ${collapsed ? "md:justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.sub}</p>
              <p className="text-[11px] text-slate-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${collapsed ? "md:px-2" : "px-2"}`}>
          {links.map((link) => (
            <NavLink key={link.to} link={link} />
          ))}
        </nav>

        {/* Collapsed bell */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-t border-slate-800">
            <div className="relative" ref={notifRef}>
              <BellButton />
              {showNotifPanel && <NotifDropdown />}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={`px-2 py-3 border-t border-slate-800 ${collapsed ? "md:px-2" : ""}`}>
          <button
            onClick={logout}
            title={collapsed ? "Logout" : ""}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all
              ${collapsed ? "md:justify-center md:px-0" : ""}
            `}
          >
            <Icon name="logout" />
            <span className={collapsed ? "md:hidden" : ""}>Log out</span>
          </button>
        </div>

      </div>
    </>
  )
}
