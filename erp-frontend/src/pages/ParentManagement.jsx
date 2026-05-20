import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/Sidebar"
import {
  getParentsAPI, createParentAPI, updateParentAPI, deleteParentAPI,
  getStudentsAPI, getCoursesAPI,
} from "../api"

// ── Student picker ────────────────────────────────────────────
function StudentPicker({ students, courses: coursesProp, selectedIds, onChange }) {
  // Fallback: derive unique course names from students if API returned nothing
  const courses = coursesProp.length > 0
    ? coursesProp
    : Array.from(new Set(students.map(s => s.course).filter(Boolean)))
        .sort()
        .map((name, i) => ({ id: i, name }))
  const [activeCourse, setActiveCourse] = useState("all")
  const [search, setSearch]             = useState("")
  const [idInput, setIdInput]           = useState("")
  const [idMsg, setIdMsg]               = useState({ text: "", error: false })
  const idRef = useRef(null)

  const toggle = (id) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])

  const remove = (id) => onChange(selectedIds.filter((x) => x !== id))

  // Add by ID
  const addById = () => {
    const num = parseInt(idInput.trim(), 10)
    if (!num) { setIdMsg({ text: "Enter a valid number", error: true }); return }
    const s = students.find((x) => x.id === num)
    if (!s) { setIdMsg({ text: `No student found with ID #${num}`, error: true }); return }
    if (selectedIds.includes(num)) { setIdMsg({ text: `${s.name} already added`, error: true }); return }
    onChange([...selectedIds, num])
    setIdInput("")
    setIdMsg({ text: `✓ ${s.name} added`, error: false })
    idRef.current?.focus()
  }

  // Filtered list
  const q = search.toLowerCase()
  const visible = students.filter((s) => {
    const byCourse = activeCourse === "all" || s.course === activeCourse
    const bySearch = !q || s.name.toLowerCase().includes(q) || String(s.id).includes(q)
    return byCourse && bySearch
  })

  const selected = selectedIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)

  return (
    <div className="space-y-3">

      {/* ── Selected chips ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="form-label mb-0">
            Linked Children
            <span className="text-slate-400 font-normal ml-1">({selectedIds.length})</span>
          </span>
          {selectedIds.length > 0 && (
            <button type="button" onClick={() => onChange([])}
              className="text-[11px] text-red-400 hover:text-red-600">Clear all</button>
          )}
        </div>
        <div className={`min-h-[40px] flex flex-wrap gap-1.5 p-2 rounded-xl border transition ${
          selected.length ? "bg-primary-50 border-primary-200" : "bg-slate-50 border-slate-200 border-dashed"
        }`}>
          {selected.length === 0
            ? <span className="text-xs text-slate-400 self-center px-1">No children selected yet</span>
            : selected.map((s) => (
              <span key={s.id}
                className="inline-flex items-center gap-1 bg-white border border-primary-200 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 text-[10px] font-bold flex items-center justify-center">
                  {s.name[0]}
                </span>
                {s.name}
                {s.course && <span className="text-primary-400 text-[10px]">· {s.course}</span>}
                <button type="button" onClick={() => remove(s.id)}
                  className="text-slate-300 hover:text-red-500 ml-0.5 leading-none text-sm">×</button>
              </span>
            ))
          }
        </div>
      </div>

      {/* ── Add by Student ID ── */}
      <div>
        <label className="form-label">Add by Student ID</label>
        <div className="flex gap-2">
          <input
            ref={idRef}
            type="number"
            className="inp flex-1"
            placeholder="Type student ID e.g. 42 and press Add"
            value={idInput}
            onChange={(e) => { setIdInput(e.target.value); setIdMsg({ text: "", error: false }) }}
            onKeyDown={(e) => e.key === "Enter" && addById()}
          />
          <button type="button" onClick={addById}
            className="btn-primary px-4 text-sm flex-shrink-0">Add</button>
        </div>
        {idMsg.text && (
          <p className={`text-xs mt-1 ${idMsg.error ? "text-red-500" : "text-emerald-600"}`}>{idMsg.text}</p>
        )}
      </div>

      {/* ── Browse by course ── */}
      <div>
        <label className="form-label">Filter by Course, then Select Student</label>

        {/* Course tabs */}
        <div className="overflow-x-auto pb-1 mb-2">
          <div className="flex gap-1.5 min-w-max">
            {/* All */}
            <button type="button" onClick={() => setActiveCourse("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition ${
                activeCourse === "all"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}>
              All ({students.length})
            </button>

            {courses.map((c) => {
              const count = students.filter((s) => s.course === c.name).length
              return (
                <button key={c.id} type="button" onClick={() => setActiveCourse(c.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition ${
                    activeCourse === c.name
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600"
                  }`}>
                  {c.name} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Search within selected course */}
        <input
          className="inp mb-2"
          placeholder={`Search student name${activeCourse === "all" ? "" : ` in ${activeCourse}`}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Student list */}
        <div className="border border-slate-200 rounded-xl overflow-hidden" style={{ maxHeight: 220, overflowY: "auto" }}>
          {visible.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              {search ? `No students matching "${search}"` : "No students in this course"}
            </div>
          ) : visible.map((s) => {
            const checked = selectedIds.includes(s.id)
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm border-b border-slate-50 last:border-0 transition ${
                  checked ? "bg-primary-50" : "hover:bg-slate-50"
                }`}>
                {/* Checkbox */}
                <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                  checked ? "bg-primary-600 border-primary-600" : "border-slate-300"
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {/* Avatar */}
                <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  checked ? "bg-primary-200 text-primary-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {s.name[0].toUpperCase()}
                </span>
                {/* Name */}
                <span className="flex-1 font-medium text-slate-800 truncate">{s.name}</span>
                {/* Course badge */}
                {s.course && (
                  <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0 truncate max-w-[100px]">
                    {s.course}
                  </span>
                )}
                {/* ID */}
                <span className="text-slate-300 text-[11px] font-mono flex-shrink-0">#{s.id}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{visible.length} student{visible.length !== 1 ? "s" : ""} shown</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ParentManagement() {
  const [parents, setParents]   = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ username: "", password: "", student_ids: [] })
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState("")

  const load = async () => {
    setLoading(true)
    setError("")

    // Load each independently so one failure doesn't block others
    try {
      const pr = await getParentsAPI()
      setParents(pr.data.parents || [])
    } catch (e) { console.error("parents failed", e) }

    try {
      const sr = await getStudentsAPI()
      const list = sr.data.students ?? sr.data ?? []
      setStudents(Array.isArray(list) ? list : [])
    } catch (e) { console.error("students failed", e); setError("Could not load students: " + (e.response?.data?.detail || e.message)) }

    try {
      const cr = await getCoursesAPI()
      const list = cr.data.courses ?? cr.data ?? []
      setCourses(Array.isArray(list) ? list : [])
    } catch (e) { console.error("courses failed", e) }

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ username: "", password: "", student_ids: [] })
    setFormErr(""); setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({ username: p.username, password: "", student_ids: p.student_ids || [] })
    setFormErr(""); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.username.trim())            { setFormErr("Username is required"); return }
    if (!editing && !form.password.trim()) { setFormErr("Password is required"); return }
    if (form.student_ids.length === 0)    { setFormErr("Link at least one student"); return }
    setSaving(true); setFormErr("")
    try {
      if (editing) {
        await updateParentAPI(editing.id, form)
        setSuccess("Parent updated")
      } else {
        await createParentAPI(form)
        setSuccess("Parent account created")
      }
      setShowForm(false); load()
    } catch (err) {
      setFormErr(err.response?.data?.detail || "Failed to save")
    } finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete parent "${p.username}"?`)) return
    try { await deleteParentAPI(p.id); setSuccess("Parent deleted"); load() }
    catch (err) { setError(err.response?.data?.detail || "Delete failed") }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Parent Accounts</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage parent logins and their linked children</p>
            </div>
            <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm">+ Add Parent</button>
          </div>

          {error   && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : parents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">👨‍👧</div>
              <p className="text-lg font-semibold text-slate-600">No parent accounts yet</p>
              <p className="text-sm mt-1">Click "Add Parent" to create the first one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parents.map((p) => (
                <div key={p.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {p.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{p.username}</p>
                        <span className="text-[11px] bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full">
                          {p.students.length} {p.students.length === 1 ? "child" : "children"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.students.length === 0
                          ? <span className="text-xs text-slate-400">No children linked</span>
                          : p.students.map((s) => (
                            <span key={s.id}
                              className="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-100">
                              {s.name}{s.course ? ` · ${s.course}` : ""}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(p)}
                      className="text-xs text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col" style={{ maxHeight: "92vh" }}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="font-bold text-slate-900">
                {editing ? "Edit Parent Account" : "Create Parent Account"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {formErr && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-sm">{formErr}</div>
              )}

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Username</label>
                  <input className="inp" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. parent_sharma" />
                </div>
                <div>
                  <label className="form-label">
                    Password{editing && <span className="text-slate-400 font-normal text-[11px] ml-1">(blank = keep)</span>}
                  </label>
                  <input className="inp" type="password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editing ? "Leave blank to keep" : "Enter password"} />
                </div>
              </div>

              {/* Student picker */}
              {students.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded-xl px-4 py-3 text-sm">
                  ⚠️ No students loaded. Make sure students are added first in the Students section.
                </div>
              ) : (
                <StudentPicker
                  students={students}
                  courses={courses}
                  selectedIds={form.student_ids}
                  onChange={(ids) => setForm((f) => ({ ...f, student_ids: ids }))}
                />
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm">
                {saving ? "Saving…"
                  : editing
                    ? `Update (${form.student_ids.length} child${form.student_ids.length !== 1 ? "ren" : ""})`
                    : `Create (${form.student_ids.length} child${form.student_ids.length !== 1 ? "ren" : ""})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
