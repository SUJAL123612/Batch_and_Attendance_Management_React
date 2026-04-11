import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Branch from './pages/Branch'
import Courses from './pages/Courses'
import Manager from './pages/Manager'
import Faculties from './pages/Faculties'
import Students from './pages/Students'
import Batch from './pages/Batch'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="branch" element={<Branch />} />
        <Route path="courses" element={<Courses />} />
        <Route path="manager" element={<Manager />} />
        <Route path="faculties" element={<Faculties />} />
        <Route path="students" element={<Students />} />
        <Route path="batches" element={<Batch />} />
      </Route>
    </Routes>
  )
}

export default App
