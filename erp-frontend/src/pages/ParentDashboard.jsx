import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import {
  getParentChildrenAPI,
  getParentChildFeesAPI,
  getParentChildGradesAPI,
  getParentChildAttendanceAPI,
  getParentChildTimetableAPI,
  getParentChildExamsAPI,
  getParentChildNoticesAPI,
} from "../api"

// ── tiny helpers ─────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  )
}

function StatBadge({ label, value, color = "bg-slate-100 text-slate-700" }) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-primary-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  )
}

function AttendanceBar({ pct }) {
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

// ── Child detail panel ────────────────────────────────────────
function ChildDetail({ child }) {
  const [tab, setTab]             = useState("overview")
  const [fees, setFees]           = useState(null)
  const [grades, setGrades]       = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [timetable, setTimetable] = useState(null)
  const [exams, setExams]         = useState(null)
  const [notices, setNotices]     = useState(null)
  const [loading, setLoading]     = useState(false)

  const load = async (t) => {
    setTab(t)
    setLoading(true)
    try {
      if (t === "fees" && !fees) {
        const r = await getParentChildFeesAPI(child.id)
        setFees(r.data.fees)
      } else if (t === "grades" && !grades) {
        const r = await getParentChildGradesAPI(child.id)
        setGrades(r.data.grades)
      } else if (t === "attendance" && !attendance) {
        const r = await getParentChildAttendanceAPI(child.id)
        setAttendance(r.data)
      } else if (t === "timetable" && !timetable) {
        const r = await getParentChildTimetableAPI(child.id)
        setTimetable(r.data)
      } else if (t === "exams" && !exams) {
        const r = await getParentChildExamsAPI(child.id)
        setExams(r.data)
      } else if (t === "notices" && !notices) {
        const r = await getParentChildNoticesAPI(child.id)
        setNotices(r.data.notices)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const attPct  = child.attendance.percentage
  const attColor = attPct >= 75 ? "text-emerald-600" : attPct >= 50 ? "text-amber-600" : "text-red-600"

  const TABS = [
    { key: "overview",    label: "Overview" },
    { key: "fees",        label: "Fees" },
    { key: "grades",      label: "Grades" },
    { key: "attendance",  label: "Attendance" },
    { key: "timetable",   label: "Timetable" },
    { key: "exams",       label: "Exams" },
    { key: "notices",     label: "Notices" },
  ]

  return (
    <div className="space-y-4">
      {/* Tabs — scrollable row */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {TABS.map(({ key, label }) => (
            <TabBtn key={key} active={tab === key} onClick={() => load(key)}>
              {label}
            </TabBtn>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Overview */}
      {tab === "overview" && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Attendance" value={`${attPct}%`}
              color={attPct >= 75 ? "bg-emerald-50 text-emerald-700" : attPct >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"} />
            <StatBadge label="Fees Paid" value={`₹${(child.fees.paid || 0).toLocaleString()}`}
              color="bg-blue-50 text-blue-700" />
            <StatBadge label="Pending" value={`₹${(child.fees.pending || 0).toLocaleString()}`}
              color={child.fees.pending > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"} />
          </div>

          {/* Profile */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Profile</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ["Student Code", child.student_code],
                ["Course",       child.course || "—"],
                ["Father Name",  child.father_name || "—"],
                ["DOB",          child.dob || "—"],
                ["Phone",        child.phone || "—"],
                ["Medium",       child.medium || "—"],
                ["School",       child.school || "—"],
                ["Admission",    child.admission_date || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-400 text-xs">{k}</span>
                  <p className="text-slate-800 font-medium">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent grades */}
          {child.recent_grades.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Test Results</h3>
              <div className="space-y-2">
                {child.recent_grades.map((g, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{g.test_title || g.subject}</p>
                      <p className="text-xs text-slate-400">{g.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{g.marks}/{g.total_marks}</p>
                      <p className={`text-xs font-semibold ${g.percentage >= 75 ? "text-emerald-600" : g.percentage >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {g.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {tab === "fees" && !loading && fees && (
        <div className="space-y-3">
          {fees.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No fee records found</p>
          ) : fees.map((f) => (
            <Card key={f.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{f.description || "Fee Record"}</p>
                  {f.due_date && <p className="text-xs text-slate-400">Due: {f.due_date}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${f.pending <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {f.pending <= 0 ? "Paid" : `₹${f.pending.toLocaleString()} pending`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatBadge label="Total" value={`₹${(f.amount || 0).toLocaleString()}`} color="bg-slate-50 text-slate-700" />
                <StatBadge label="Paid"  value={`₹${(f.paid || 0).toLocaleString()}`}   color="bg-emerald-50 text-emerald-700" />
                <StatBadge label="Due"   value={`₹${(f.pending || 0).toLocaleString()}`} color={f.pending > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"} />
              </div>
              {f.payments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Payment History</p>
                  <div className="space-y-1">
                    {f.payments.map((p, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <span>{p.date}</span>
                        <span className="font-semibold">₹{p.amount.toLocaleString()}</span>
                        <span className="text-slate-400">{p.mode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Grades Tab */}
      {tab === "grades" && !loading && grades && (
        <Card>
          {grades.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No grades recorded yet</p>
          ) : (
            <div className="space-y-2">
              {grades.map((g) => (
                <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{g.test_title || "Test"}</p>
                    <p className="text-xs text-slate-400">{g.subject}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-700">{g.marks}/{g.total_marks}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg min-w-[48px] text-center
                      ${g.percentage >= 75 ? "bg-emerald-100 text-emerald-700"
                        : g.percentage >= 50 ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"}`}>
                      {g.grade || `${g.percentage}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Attendance Tab */}
      {tab === "attendance" && !loading && attendance && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Total"   value={attendance.summary.total}   color="bg-slate-50 text-slate-700" />
            <StatBadge label="Present" value={attendance.summary.present} color="bg-emerald-50 text-emerald-700" />
            <StatBadge label="Absent"  value={attendance.summary.absent}  color="bg-red-50 text-red-700" />
          </div>
          <Card>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Overall Attendance</span>
              <span className={`font-bold ${attColor}`}>{attendance.summary.percentage}%</span>
            </div>
            <AttendanceBar pct={attendance.summary.percentage} />
          </Card>
          <Card>
            <p className="text-sm font-semibold text-slate-700 mb-3">Attendance History</p>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {attendance.records.map((r, i) => (
                <div key={i} className="flex justify-between items-center text-sm px-3 py-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600">{r.date}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${r.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
              {attendance.records.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No attendance records</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Timetable Tab */}
      {tab === "timetable" && !loading && timetable && (
        <Card>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Weekly Timetable
            {timetable.course && <span className="text-slate-400 font-normal ml-2">— {timetable.course}</span>}
          </p>
          {timetable.timetable.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No timetable entries for this course</p>
          ) : (
            <div className="space-y-1">
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => {
                const entries = timetable.timetable.filter(e => e.day === day)
                if (!entries.length) return null
                return (
                  <div key={day}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1 mt-3 mb-1">{day}</p>
                    {entries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{e.subject}</p>
                          <p className="text-xs text-slate-400">{e.teacher}</p>
                        </div>
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                          {e.time_slot}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Exams Tab */}
      {tab === "exams" && !loading && exams && (
        <Card>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Exam Schedule
            {exams.course && <span className="text-slate-400 font-normal ml-2">— {exams.course}</span>}
          </p>
          {exams.exams.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No exams scheduled</p>
          ) : (
            <div className="space-y-2">
              {exams.exams.map((e) => {
                const isUpcoming = new Date(e.exam_date) >= new Date()
                return (
                  <div key={e.id} className={`rounded-xl px-4 py-3 border ${isUpcoming ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>
                        {e.syllabus && <p className="text-xs text-slate-400 mt-1">{e.syllabus}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-700">{e.exam_date}</p>
                        {e.exam_time && <p className="text-xs text-slate-400">{e.exam_time}</p>}
                        <div className="flex gap-1.5 mt-1 justify-end">
                          {e.duration && <span className="text-[11px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">{e.duration}</span>}
                          {e.total_marks && <span className="text-[11px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">{e.total_marks} marks</span>}
                        </div>
                      </div>
                    </div>
                    {isUpcoming && (
                      <span className="text-[11px] font-semibold text-amber-600 mt-1 inline-block">📅 Upcoming</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Notices Tab */}
      {tab === "notices" && !loading && notices && (
        <div className="space-y-2">
          {notices.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm text-center py-6">No notices</p>
            </Card>
          ) : notices.map((n) => (
            <Card key={n.id} className="!p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {n.course && (
                    <span className="text-[11px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{n.course}</span>
                  )}
                  <span className="text-[11px] text-slate-400">{n.date}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const [children, setChildren]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  useEffect(() => {
    getParentChildrenAPI()
      .then((r) => {
        setChildren(r.data.children)
        if (r.data.children.length > 0) setSelected(r.data.children[0].id)
      })
      .catch(() => setError("Failed to load children data"))
      .finally(() => setLoading(false))
  }, [])

  const child = children.find((c) => c.id === selected)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <img src="/rama_logo.jpeg" alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">RAMA Coaching</p>
            <p className="text-xs text-slate-400">Parent Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
            <p className="text-xs text-slate-400">Parent Account</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600">{error}</div>
        ) : children.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">👨‍👧</div>
            <p className="text-lg font-semibold text-slate-600">No children linked</p>
            <p className="text-sm mt-1">Contact your institute admin to link your child's account.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Child selector */}
            {children.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Select Child</p>
                <div className="flex gap-3 flex-wrap">
                  {children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left transition ${
                        selected === c.id
                          ? "bg-primary-600 text-white border-primary-600 shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:border-primary-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${selected === c.id ? "bg-white/20 text-white" : "bg-primary-50 text-primary-600"}`}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className={`text-xs ${selected === c.id ? "text-white/70" : "text-slate-400"}`}>
                          {c.course || "No Course"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Child header */}
            {child && (
              <Card className="!p-4">
                <div className="flex items-center gap-4">
                  {child.photo ? (
                    <img src={child.photo} alt={child.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-2xl font-bold text-primary-600">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900">{child.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                      {child.student_code && (
                        <span className="text-xs text-slate-400 font-mono">{child.student_code}</span>
                      )}
                      {child.course && (
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                          {child.course}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className={`text-2xl font-black ${child.attendance.percentage >= 75 ? "text-emerald-600" : child.attendance.percentage >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {child.attendance.percentage}%
                    </p>
                    <p className="text-xs text-slate-400">Attendance</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Detail section */}
            {child && <ChildDetail key={child.id} child={child} />}
          </div>
        )}
      </div>
    </div>
  )
}
