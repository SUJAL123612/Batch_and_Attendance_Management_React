import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, Search, Plus, X, Users, UserPlus,
  Calendar, Clock, Monitor, MapPin, Wifi, BookOpen,
  GraduationCap, Trash2, User, Mail, Phone, AlertTriangle
} from 'lucide-react'

const API = 'http://localhost:9998/batches'
const STUDENTS_API = 'http://localhost:9998/students'
const BATCH_STUDENTS_API = 'http://localhost:9998/batch_students'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700'
}

const modeColors = {
  online: 'bg-purple-100 text-purple-700',
  offline: 'bg-amber-100 text-amber-700',
  hybrid: 'bg-cyan-100 text-cyan-700'
}

function BatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [batch, setBatch] = useState(null)
  const [batchStudents, setBatchStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)

  // Search and filter
  const [searchText, setSearchText] = useState('')

  // Modals
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null })

  // New student form
  const [newStudentForm, setNewStudentForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    alternate_mobile: '',
    dob: '',
    email: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Fetch batch details
  const fetchBatch = async () => {
    try {
      const res = await axios.get(`${API}/get_batch/${id}`)
      let data = res.data.data || res.data
      if (Array.isArray(data)) data = data[0]
      setBatch(data)
    } catch (err) {
      console.error('Failed to fetch batch:', err)
    }
  }

  // Fetch students in this batch
  const fetchBatchStudents = async () => {
    setStudentsLoading(true)
    try {
      // Try batch_students API first, fall back to batches API
      let res
      try {
        res = await axios.get(`${BATCH_STUDENTS_API}/get_batch_student_list`, {
          params: { batch_id: id }
        })
      } catch {
        // Fallback to batches endpoint
        res = await axios.get(`${API}/get_batch_students/${id}`)
      }
      const data = res.data.data || res.data
      setBatchStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[v0] Failed to fetch batch students:', err)
      setBatchStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

  // Fetch all students (for adding existing)
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${STUDENTS_API}/get_student_list`, {
        params: { page_size: 1000 }
      })
      const data = res.data.data || res.data
      setAllStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch all students:', err)
      setAllStudents([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchBatch(), fetchBatchStudents(), fetchAllStudents()])
      setLoading(false)
    }
    loadData()
  }, [id])

  // Filter batch students by search
  const filteredStudents = batchStudents.filter((student) => {
    if (!searchText) return true
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase()
    const email = (student.email || '').toLowerCase()
    const mobile = (student.mobile || '').toLowerCase()
    const search = searchText.toLowerCase()
    return fullName.includes(search) || email.includes(search) || mobile.includes(search)
  })



  // Get students not in this batch
  const availableStudents = allStudents.filter(
    (student) => !batchStudents.some((bs) => bs.id === student.id || bs.student_id === student.id)
  )

  // Add existing student to batch
  const handleAddExistingStudent = async () => {
    if (!selectedStudentId) {
      alert('Please select a student')
      return
    }
    try {
      // Try batch_students API first
      try {
        await axios.post(`${BATCH_STUDENTS_API}/create_batch_student`, {
          batch_id: Number(id),
          student_id: Number(selectedStudentId)
        })
      } catch {
        // Fallback to batches endpoint
        await axios.post(`${API}/add_student_to_batch`, {
          batch_id: Number(id),
          student_id: Number(selectedStudentId)
        })
      }
      setIsAddExistingOpen(false)
      setSelectedStudentId('')
      await fetchBatchStudents()
      await fetchAllStudents()
    } catch (err) {
      console.error('[v0] Failed to add student to batch:', err)
      alert('Failed to save student. Please check if the API endpoint exists.')
    }
  }

  // Validate new student form
  const validateForm = () => {
    const errors = {}
    if (!newStudentForm.first_name.trim()) errors.first_name = 'First name is required'
    if (!newStudentForm.last_name.trim()) errors.last_name = 'Last name is required'
    if (!newStudentForm.mobile.trim()) {
      errors.mobile = 'Mobile number is required'
    } else if (!/^[0-9]{10,11}$/.test(newStudentForm.mobile)) {
      errors.mobile = 'Enter a valid mobile number'
    }
    if (newStudentForm.alternate_mobile && !/^[0-9]{10,11}$/.test(newStudentForm.alternate_mobile)) {
      errors.alternate_mobile = 'Enter a valid mobile number'
    }
    if (!newStudentForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudentForm.email)) {
      errors.email = 'Enter a valid email address'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create new student and add to batch
  const handleCreateNewStudent = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    try {
      // First create the student
      const createRes = await axios.post(`${STUDENTS_API}/create_student`, newStudentForm)
      const newStudentId = createRes.data.data?.id || createRes.data.id || createRes.data.insertId
      
      if (newStudentId) {
        // Then add to batch - try batch_students API first
        try {
          await axios.post(`${BATCH_STUDENTS_API}/create_batch_student`, {
            batch_id: Number(id),
            student_id: Number(newStudentId)
          })
        } catch {
          // Fallback to batches endpoint
          await axios.post(`${API}/add_student_to_batch`, {
            batch_id: Number(id),
            student_id: Number(newStudentId)
          })
        }
      }

      setIsNewStudentOpen(false)
      setNewStudentForm({
        first_name: '',
        last_name: '',
        mobile: '',
        alternate_mobile: '',
        dob: '',
        email: ''
      })
      setFormErrors({})
      await fetchBatchStudents()
      await fetchAllStudents()
    } catch (err) {
      console.error('Failed to create student:', err)
      alert('Failed to save student')
    }
  }

  // Remove student from batch
  const handleRemoveStudent = async () => {
    if (!deleteModal.student) return
    try {
      const studentId = deleteModal.student.student_id || deleteModal.student.id
      const batchStudentId = deleteModal.student.batch_student_id || deleteModal.student.id
      
      // Try batch_students API first
      try {
        await axios.delete(`${BATCH_STUDENTS_API}/delete_batch_student/${batchStudentId}`)
      } catch {
        // Fallback to batches endpoint
        await axios.delete(`${API}/remove_student_from_batch/${id}/${studentId}`)
      }
      
      setDeleteModal({ isOpen: false, student: null })
      await fetchBatchStudents()
      await fetchAllStudents()
    } catch (err) {
      console.error('Failed to remove student:', err)
      alert('Failed to remove student from batch')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500">Loading batch details...</span>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Batch not found</p>
        <button
          onClick={() => navigate('/batches')}
          className="mt-4 text-primary-600 hover:underline"
        >
          Go back to batches
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/batches')}
            className="mt-1 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{batch.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[batch.batch_status] || 'bg-slate-100 text-slate-600'}`}>
                {batch.batch_status || '-'}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              {batchStudents.length} student{batchStudents.length !== 1 ? 's' : ''} 
              {batch.course_name && ` · ${batch.course_name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddExistingOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">Existing</span>
          </button>
          <button
            onClick={() => setIsNewStudentOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Student</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email, or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {studentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-500">Loading students...</span>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <div key={student.id || student.student_id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {student.first_name} {student.last_name}
                    </p>
                    <div className="flex items-center gap-4 mt-0.5">
                      {student.email && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </span>
                      )}
                      {student.mobile && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {student.mobile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, student })}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {searchText ? 'No students match your search' : 'No students in this batch yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {searchText ? 'Try a different search term.' : 'Add students to get started.'}
            </p>
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Existing Student Modal */}
      {isAddExistingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddExistingOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Add Existing Student</h2>
                <p className="text-sm text-slate-500">Batch: {batch.name}</p>
              </div>
              <button
                onClick={() => setIsAddExistingOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select a student</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} — {student.email}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Only students not already in this batch are shown.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddExistingOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExistingStudent}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add to Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Student Modal */}
      {isNewStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNewStudentOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Add New Student</h2>
                <p className="text-sm text-slate-500">Batch: {batch.name}</p>
              </div>
              <button
                onClick={() => setIsNewStudentOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.first_name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      setNewStudentForm({ ...newStudentForm, first_name: value })
                    }}
                    className={`w-full px-4 py-2.5 border ${formErrors.first_name ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter first name"
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.last_name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      setNewStudentForm({ ...newStudentForm, last_name: value })
                    }}
                    className={`w-full px-4 py-2.5 border ${formErrors.last_name ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter last name"
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${formErrors.email ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newStudentForm.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setNewStudentForm({ ...newStudentForm, mobile: value })
                    }}
                    maxLength={11}
                    className={`w-full px-4 py-2.5 border ${formErrors.mobile ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter mobile"
                  />
                  {formErrors.mobile && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.mobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Alternate Mobile
                  </label>
                  <input
                    type="tel"
                    value={newStudentForm.alternate_mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setNewStudentForm({ ...newStudentForm, alternate_mobile: value })
                    }}
                    maxLength={11}
                    className={`w-full px-4 py-2.5 border ${formErrors.alternate_mobile ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter alternate mobile"
                  />
                  {formErrors.alternate_mobile && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.alternate_mobile}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={newStudentForm.dob}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewStudentOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create and Add to Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, student: null })}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Remove Student</h3>
              <p className="text-slate-500 mb-2">Are you sure you want to remove this student from the batch?</p>
              <div className="bg-slate-100 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-slate-600">Student</p>
                <p className="font-semibold text-slate-800">
                  {deleteModal.student?.first_name} {deleteModal.student?.last_name}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, student: null })}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveStudent}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchDetail
