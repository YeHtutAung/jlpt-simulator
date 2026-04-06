import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard    from './pages/Dashboard'
import UploadExam   from './pages/UploadExam'
import ManageExams  from './pages/ManageExams'
import AdminLayout  from './components/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index              element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="upload"      element={<UploadExam />} />
          <Route path="exams"       element={<ManageExams />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
