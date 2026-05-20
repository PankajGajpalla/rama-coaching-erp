import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { lazy, Suspense } from "react"

// ─── Eager (landing pages need instant load) ─────────────────
import Login    from "./pages/Login"
import Register from "./pages/Register"

// ─── Lazy (loaded only when navigated to) ────────────────────
const Dashboard          = lazy(() => import("./pages/Dashboard"))
const Students           = lazy(() => import("./pages/Students"))
const Attendance         = lazy(() => import("./pages/Attendance"))
const Fees               = lazy(() => import("./pages/Fees"))
const Teachers           = lazy(() => import("./pages/Teachers"))
const Grades             = lazy(() => import("./pages/Grades"))
const Timetable          = lazy(() => import("./pages/Timetable"))
const Notices            = lazy(() => import("./pages/Notices"))
const ImportStudents     = lazy(() => import("./pages/ImportStudents"))
const Courses            = lazy(() => import("./pages/Courses"))
const TeacherDashboard   = lazy(() => import("./pages/TeacherDashboard"))
const StaffDashboard     = lazy(() => import("./pages/StaffDashboard"))
const TeacherAttendance  = lazy(() => import("./pages/TeacherAttendance"))
const TeacherStudents    = lazy(() => import("./pages/TeacherStudents"))
const TeacherGrades      = lazy(() => import("./pages/TeacherGrades"))
const AdminAccounts      = lazy(() => import("./pages/AdminAccounts"))
const ExamSchedule       = lazy(() => import("./pages/ExamSchedule"))
const AuditLog           = lazy(() => import("./pages/AuditLog"))
const DataExport         = lazy(() => import("./pages/DataExport"))
const AttendanceReport   = lazy(() => import("./pages/AttendanceReport"))
const GrievanceManagement = lazy(() => import("./pages/GrievanceManagement"))
const StudentGrievance   = lazy(() => import("./pages/StudentGrievance"))
const ParentDashboard    = lazy(() => import("./pages/ParentDashboard"))
const ParentManagement   = lazy(() => import("./pages/ParentManagement"))

// ─── Loading Spinner ─────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-9 h-9 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm font-medium">Loading…</p>
      </div>
    </div>
  )
}

// ─── Route Guards ────────────────────────────────────────────

// Any logged in user
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Admin only
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === "student") return <Navigate to="/student/dashboard" replace />
  if (user.role === "teacher") return <Navigate to="/teacher" replace />
  if (user.role === "staff")   return <Navigate to="/staff/dashboard" replace />
  if (user.role === "parent")  return <Navigate to="/parent/dashboard" replace />
  if (user.role !== "admin")   return <Navigate to="/login" replace />
  return children
}

// Staff only
function StaffRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "staff") return <Navigate to="/login" replace />
  return children
}

// ✅ Teacher only route
function TeacherRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "teacher") return <Navigate to="/dashboard" replace />
  return children
}

// Parent only
function ParentRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "parent") return <Navigate to="/login" replace />
  return children
}

// ✅ Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) {
    if (user.role === "teacher") return <Navigate to="/teacher" replace />
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />
    if (user.role === "staff")   return <Navigate to="/staff/dashboard" replace />
    if (user.role === "parent")  return <Navigate to="/parent/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// ─── 404 Page ────────────────────────────────────────────────
function NotFound() {
  const { user } = useAuth()
  const home =
    user?.role === "teacher" ? "/teacher" :
    user?.role === "student" ? "/student/dashboard" :
    user?.role === "staff"   ? "/staff/dashboard" :
    user?.role === "parent"  ? "/parent/dashboard" : "/dashboard"
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center px-6 max-w-sm">
        <p className="text-9xl font-black text-slate-100 select-none leading-none mb-4">404</p>
        <p className="text-xl font-bold text-slate-800 mb-2">Page not found</p>
        <p className="text-slate-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a href={home} className="btn-primary inline-flex">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}

// ─── Page Suspense fallback ──────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* Public routes — redirect to dashboard if logged in */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Admin routes */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
        <Route path="/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
        <Route path="/fees" element={<AdminRoute><Fees /></AdminRoute>} />
        <Route path="/teachers" element={<AdminRoute><Teachers /></AdminRoute>} />
        <Route path="/grades" element={<AdminRoute><Grades /></AdminRoute>} />
        <Route path="/timetable" element={<AdminRoute><Timetable /></AdminRoute>} />
        <Route path="/notices" element={<AdminRoute><Notices /></AdminRoute>} />
        <Route path="/import" element={<AdminRoute><ImportStudents /></AdminRoute>} />
        <Route path="/courses" element={<AdminRoute><Courses /></AdminRoute>} />
        <Route path="/admin-accounts" element={<AdminRoute><AdminAccounts /></AdminRoute>} />
        <Route path="/exam-schedule"  element={<AdminRoute><ExamSchedule /></AdminRoute>} />
        <Route path="/audit-log"           element={<AdminRoute><AuditLog /></AdminRoute>} />
        <Route path="/data-export"         element={<AdminRoute><DataExport /></AdminRoute>} />
        <Route path="/attendance-report"   element={<AdminRoute><AttendanceReport /></AdminRoute>} />
        <Route path="/grievances"           element={<AdminRoute><GrievanceManagement /></AdminRoute>} />
        <Route path="/parents"              element={<AdminRoute><ParentManagement /></AdminRoute>} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
        <Route path="/teacher/attendance" element={<TeacherRoute><TeacherAttendance /></TeacherRoute>} />
        <Route path="/teacher/students" element={<TeacherRoute><TeacherStudents /></TeacherRoute>} />
        <Route path="/teacher/grades" element={<TeacherRoute><TeacherGrades /></TeacherRoute>} />
        <Route path="/teacher/timetable" element={<TeacherRoute><Timetable /></TeacherRoute>} />
        <Route path="/teacher/exam-schedule" element={<TeacherRoute><ExamSchedule /></TeacherRoute>} />
        <Route path="/teacher/notices" element={<TeacherRoute><Notices /></TeacherRoute>} />

        {/* Staff routes */}
        <Route path="/staff/dashboard"     element={<StaffRoute><StaffDashboard /></StaffRoute>} />
        <Route path="/staff/students"      element={<StaffRoute><Students /></StaffRoute>} />
        <Route path="/staff/attendance"    element={<StaffRoute><Attendance /></StaffRoute>} />
        <Route path="/staff/grades"        element={<StaffRoute><Grades /></StaffRoute>} />
        <Route path="/staff/notices"       element={<StaffRoute><Notices /></StaffRoute>} />
        <Route path="/staff/timetable"     element={<StaffRoute><Timetable /></StaffRoute>} />
        <Route path="/staff/exam-schedule" element={<StaffRoute><ExamSchedule /></StaffRoute>} />
        <Route path="/staff/import"             element={<StaffRoute><ImportStudents /></StaffRoute>} />
        <Route path="/staff/attendance-report"  element={<StaffRoute><AttendanceReport /></StaffRoute>} />
        <Route path="/staff/grievances"         element={<StaffRoute><GrievanceManagement /></StaffRoute>} />

        {/* Parent routes */}
        <Route path="/parent/dashboard" element={<ParentRoute><ParentDashboard /></ParentRoute>} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
        <Route path="/student/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
        <Route path="/student/exam-schedule" element={<ProtectedRoute><ExamSchedule /></ProtectedRoute>} />
        <Route path="/student/notices"     element={<ProtectedRoute><Notices /></ProtectedRoute>} />
        <Route path="/student/grievances"  element={<ProtectedRoute><StudentGrievance /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}