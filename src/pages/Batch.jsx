import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  X, Users, AlertTriangle, Calendar, Clock, Monitor,
  MapPin, Wifi, BookOpen, GraduationCap, ArrowLeft, UserPlus, 
  User, Mail, Phone
} from 'lucide-react'

const API = 'http://localhost:9998/batches'
const COURSES_API = 'http://localhost:9998/courses'
const MANAGERS_API = 'http://localhost:9998/manager'
const FACULTIES_API = 'http://localhost:9998/faculties'
const STUDENTS_API = 'http://localhost:9998/students'
const BATCH_STUDENTS_API = 'http://localhost:9998/batch_students'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700'
}
const statusHeaderColors = {
  upcoming: 'bg-blue-600',
  ongoing: 'bg-emerald-600',
  completed: 'bg-slate-500',
  cancelled: 'bg-red-500'
}
const modeColors = {
  online: 'bg-purple-100 text-purple-700',
  offline: 'bg-amber-100 text-amber-700',
  hybrid: 'bg-cyan-100 text-cyan-700'
}
const categoryColors = {
  weekday: 'bg-indigo-100 text-indigo-700',
  weekend: 'bg-pink-100 text-pink-700'
}

// ── Helpers ────────────────────────────────────────────────────────────────
const extractData = (response) => {
  const d = response.data
  if (Array.isArray(d)) return d
  if (d?.data && Array.isArray(d.data)) return d.data
  if (d?.rows && Array.isArray(d.rows)) return d.rows
  if (d?.result && Array.isArray(d.result)) return d.result
  return []
}

const fullName = (obj) =>
  `${obj.first_name || ''} ${obj.last_name || ''}`.trim() || String(obj.id ?? '')

const courseLabel = (obj) =>
  obj.name || obj.course_name || obj.title || String(obj.id ?? '')

const emptyForm = {
  name: '', manager_id: '', faculty_id: '', course_id: '',
  description: '', batch_status: 'upcoming', batch_category: 'weekday',
  batch_mode: 'online', batch_time: '', start_date: '', end_date: ''
}

// ── Component ──────────────────────────────────────────────────────────────
function Batch() {
  // View state: 'list' or 'detail'
  const [view, setView] = useState('list')
  const [selectedBatch, setSelectedBatch] = useState(null)

  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [courses, setCourses] = useState([])
  const [managers, setManagers] = useState([])
  const [faculties, setFaculties] = useState([])

  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, batch: null })

  const [pageSize, setPageSize] = useState(5)
  const [pageIndex, setPageIndex] = useState(1)
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('ASC')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')

  // Detail view state
  const [batchStudents, setBatchStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [studentSearchText, setStudentSearchText] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [deleteStudentModal, setDeleteStudentModal] = useState({ isOpen: false, student: null })
  const [newStudentForm, setNewStudentForm] = useState({
    first_name: '', last_name: '', mobile: '', alternate_mobile: '', dob: '', email: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // ── Client-side filtering (guaranteed fallback) ──────────────────────────
  const filteredBatches = batches.filter((batch) => {
    const matchStatus = !statusFilter || batch.batch_status === statusFilter
    const matchMode = !modeFilter || batch.batch_mode === modeFilter
    const matchSearch = !searchText || batch.name?.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchMode && matchSearch
  })

  // ── Fetch dropdowns ──────────────────────────────────────────────────────
  const fetchDropdownData = async () => {
    try {
      const [coursesRes, managersRes, facultiesRes] = await Promise.all([
        axios.get(`${COURSES_API}/get_course_list`),
        axios.get(`${MANAGERS_API}/get_manager_list`),
        axios.get(`${FACULTIES_API}/get_faculty_list`)
      ])
      setCourses(extractData(coursesRes))
      setManagers(extractData(managersRes))
      setFaculties(extractData(facultiesRes))
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err)
    }
  }

  // ── Fetch batches ────────────────────────────────────────────────────────
  const fetchBatches = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/get_batch_list`, {
        params: {
          page_size: pageSize,
          page_index: pageIndex,
          sort_by: sortBy,
          sort_order: sortOrder,
          search_text: searchText,
          batch_status: statusFilter || undefined,
          batch_mode: modeFilter || undefined
        }
      })
      const data = res.data.data || res.data
      setBatches(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch error:', err)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDropdownData() }, [])
  useEffect(() => { fetchBatches() }, [pageIndex, pageSize, sortBy, sortOrder, statusFilter, modeFilter])

  // ── Detail View Functions ────────────────────────────────────────────────
  const fetchBatchStudents = async (batchId) => {
    setStudentsLoading(true)
    try {
      let res
      try {
        res = await axios.get(`${BATCH_STUDENTS_API}/get_batch_student_list`, {
          params: { batch_id: batchId }
        })
      } catch {
        res = await axios.get(`${API}/get_batch_students/${batchId}`)
      }
      const data = res.data.data || res.data
      setBatchStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch batch students:', err)
      setBatchStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

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

  const openBatchDetail = async (batch) => {
    setSelectedBatch(batch)
    setView('detail')
    setStudentSearchText('')
    await Promise.all([fetchBatchStudents(batch.id), fetchAllStudents()])
  }

  const closeBatchDetail = () => {
    setView('list')
    setSelectedBatch(null)
    setBatchStudents([])
    setStudentSearchText('')
  }

  // Filter students in batch by search
  const filteredBatchStudents = batchStudents.filter((student) => {
    if (!studentSearchText) return true
    const name = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase()
    const email = (student.email || '').toLowerCase()
    const mobile = (student.mobile || '').toLowerCase()
    const search = studentSearchText.toLowerCase()
    return name.includes(search) || email.includes(search) || mobile.includes(search)
  })

  // Students not already in batch (for adding)
  const availableStudents = allStudents.filter(
    (s) => !batchStudents.some((bs) => (bs.student_id || bs.id) === s.id)
  )

  // Add existing student to batch
  const handleAddExistingStudent = async () => {
    if (!selectedStudentId || !selectedBatch) {
      alert('Please select a student')
      return
    }
    try {
      try {
        await axios.post(`${BATCH_STUDENTS_API}/create_batch_student`, {
          batch_id: Number(selectedBatch.id),
          student_id: Number(selectedStudentId)
        })
      } catch {
        await axios.post(`${API}/add_student_to_batch`, {
          batch_id: Number(selectedBatch.id),
          student_id: Number(selectedStudentId)
        })
      }
      setIsAddExistingOpen(false)
      setSelectedStudentId('')
      await Promise.all([fetchBatchStudents(selectedBatch.id), fetchAllStudents()])
    } catch (err) {
      console.error('Failed to add student to batch:', err)
      alert('Failed to save student')
    }
  }

  // Validate new student form
  const validateNewStudentForm = () => {
    const errors = {}
    if (!newStudentForm.first_name.trim()) errors.first_name = 'First name is required'
    if (!newStudentForm.last_name.trim()) errors.last_name = 'Last name is required'
    if (!newStudentForm.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(newStudentForm.email)) errors.email = 'Invalid email'
    if (!newStudentForm.mobile.trim()) errors.mobile = 'Mobile is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create new student and add to batch
  const handleCreateNewStudent = async (e) => {
    e.preventDefault()
    if (!validateNewStudentForm() || !selectedBatch) return
    try {
      const createRes = await axios.post(`${STUDENTS_API}/create_student`, newStudentForm)
      const newStudentId = createRes.data.data?.id || createRes.data.id || createRes.data.insertId
      if (newStudentId) {
        try {
          await axios.post(`${BATCH_STUDENTS_API}/create_batch_student`, {
            batch_id: Number(selectedBatch.id),
            student_id: Number(newStudentId)
          })
        } catch {
          await axios.post(`${API}/add_student_to_batch`, {
            batch_id: Number(selectedBatch.id),
            student_id: Number(newStudentId)
          })
        }
      }
      setIsNewStudentOpen(false)
      setNewStudentForm({ first_name: '', last_name: '', mobile: '', alternate_mobile: '', dob: '', email: '' })
      setFormErrors({})
      await Promise.all([fetchBatchStudents(selectedBatch.id), fetchAllStudents()])
    } catch (err) {
      console.error('Failed to create student:', err)
      alert('Failed to create student')
    }
  }

  // Remove student from batch
  const handleRemoveStudent = async () => {
    if (!deleteStudentModal.student || !selectedBatch) return
    try {
      const studentId = deleteStudentModal.student.student_id || deleteStudentModal.student.id
      const batchStudentId = deleteStudentModal.student.batch_student_id || deleteStudentModal.student.id
      try {
        await axios.delete(`${BATCH_STUDENTS_API}/delete_batch_student/${batchStudentId}`)
      } catch {
        await axios.delete(`${API}/remove_student_from_batch/${selectedBatch.id}/${studentId}`)
      }
      setDeleteStudentModal({ isOpen: false, student: null })
      await Promise.all([fetchBatchStudents(selectedBatch.id), fetchAllStudents()])
    } catch (err) {
      console.error('Failed to remove student:', err)
      alert('Failed to remove student from batch')
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = async (id) => {
    try {
      setLoading(true)
      const [batchRes, coursesRes, managersRes, facultiesRes] = await Promise.all([
        axios.get(`${API}/get_batch/${id}`),
        axios.get(`${COURSES_API}/get_course_list`),
        axios.get(`${MANAGERS_API}/get_manager_list`),
        axios.get(`${FACULTIES_API}/get_faculty_list`)
      ])

      setCourses(extractData(coursesRes))
      setManagers(extractData(managersRes))
      setFaculties(extractData(facultiesRes))

      let batchData = batchRes.data.data || batchRes.data
      if (Array.isArray(batchData)) batchData = batchData[0]

      setForm({
        name: batchData.name || '',
        manager_id: batchData.manager_id ? String(batchData.manager_id) : '',
        faculty_id: batchData.faculty_id ? String(batchData.faculty_id) : '',
        course_id: batchData.course_id ? String(batchData.course_id) : '',
        description: batchData.description || '',
        batch_status: batchData.batch_status || 'upcoming',
        batch_category: batchData.batch_category || 'weekday',
        batch_mode: batchData.batch_mode || 'online',
        batch_time: batchData.batch_time || '',
        start_date: batchData.start_date ? batchData.start_date.split('T')[0] : '',
        end_date: batchData.end_date ? batchData.end_date.split('T')[0] : ''
      })
      setEditId(batchData.id || id)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Edit fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Form handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        manager_id: Number(form.manager_id),
        faculty_id: Number(form.faculty_id),
        course_id: Number(form.course_id)
      }
      if (editId) {
        await axios.put(`${API}/update_batch`, { id: editId, ...payload })
      } else {
        await axios.post(`${API}/create_batch`, payload)
      }
      closeModal()
      fetchBatches()
    } catch (err) {
      console.error('Submit error:', err)
      alert('Failed to save batch')
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDeleteModal = (batch) => setDeleteModal({ isOpen: true, batch })
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, batch: null })

  const confirmDelete = async () => {
    if (!deleteModal.batch) return
    try {
      await axios.delete(`${API}/delete_batch/${deleteModal.batch.id}`)
      closeDeleteModal()
      fetchBatches()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete batch')
    }
  }

  // ── Search / modal ───────────────────────────────────────────────────────
  const handleSearch = () => { setPageIndex(1); fetchBatches() }

  const openCreateModal = () => { setForm(emptyForm); setEditId(null); setIsModalOpen(true) }
  const closeModal = () => { setIsModalOpen(false); setForm(emptyForm); setEditId(null) }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

// ── Render ───────────────────────────────────────────────────────────────

  // Detail View
  if (view === 'detail' && selectedBatch) {
    return (
      <div className="space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={closeBatchDetail}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 truncate">{selectedBatch.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[selectedBatch.batch_status] || 'bg-slate-100 text-slate-600'}`}>
                  {selectedBatch.batch_status}
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                {batchStudents.length} student{batchStudents.length !== 1 ? 's' : ''} 
                {selectedBatch.course_name && ` · ${selectedBatch.course_name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExistingOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-medium text-sm">Existing</span>
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
              value={studentSearchText}
              onChange={(e) => setStudentSearchText(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            {studentSearchText && (
              <button
                onClick={() => setStudentSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Students List */}
        {studentsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-500">Loading students...</span>
          </div>
        ) : filteredBatchStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBatchStudents.map((student) => (
              <div key={student.student_id || student.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-800 truncate">
                        {student.first_name} {student.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {student.email || '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteStudentModal({ isOpen: true, student })}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {student.mobile && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {student.mobile}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {studentSearchText ? 'No students match your search' : 'No students in this batch yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {studentSearchText ? 'Try a different search term.' : 'Add students to get started.'}
            </p>
            {studentSearchText && (
              <button
                onClick={() => setStudentSearchText('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Add Existing Student Modal */}
        {isAddExistingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddExistingOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Add Existing Student</h3>
                  <p className="text-sm text-slate-500">Batch: {selectedBatch.name}</p>
                </div>
                <button onClick={() => setIsAddExistingOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Choose a student...</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} — {s.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">Only students not already in this batch are shown.</p>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button onClick={() => setIsAddExistingOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Cancel
                  </button>
                  <button onClick={handleAddExistingStudent} className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                    Add to Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Student Modal */}
        {isNewStudentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNewStudentOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Add New Student</h3>
                  <p className="text-sm text-slate-500">Create and add to: {selectedBatch.name}</p>
                </div>
                <button onClick={() => setIsNewStudentOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateNewStudent} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
                    <input
                      type="text"
                      value={newStudentForm.first_name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, first_name: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${formErrors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'}`}
                    />
                    {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      value={newStudentForm.last_name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, last_name: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${formErrors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'}`}
                    />
                    {formErrors.last_name && <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'}`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile *</label>
                    <input
                      type="tel"
                      value={newStudentForm.mobile}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, mobile: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${formErrors.mobile ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'}`}
                    />
                    {formErrors.mobile && <p className="text-xs text-red-500 mt-1">{formErrors.mobile}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Alternate Mobile</label>
                    <input
                      type="tel"
                      value={newStudentForm.alternate_mobile}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, alternate_mobile: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudentForm.dob}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsNewStudentOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                    Create & Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Student Modal */}
        {deleteStudentModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteStudentModal({ isOpen: false, student: null })}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Remove Student</h3>
                <p className="text-slate-500 mb-2">Remove this student from the batch?</p>
                <div className="bg-slate-100 rounded-lg px-4 py-3 mb-6">
                  <p className="font-semibold text-slate-800">
                    {deleteStudentModal.student?.first_name} {deleteStudentModal.student?.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{deleteStudentModal.student?.email}</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setDeleteStudentModal({ isOpen: false, student: null })} className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Cancel
                  </button>
                  <button onClick={handleRemoveStudent} className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
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

  // List View
  return (
  <div className="space-y-6 min-w-0">
  
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800">Batch Management</h1>
          <p className="text-slate-500 mt-1">Manage your institute batches and schedules</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Batch</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-4">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value); setPageIndex(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            Search
          </button>

          {/* Clear Filters */}
          {(statusFilter || modeFilter || searchText) && (
            <button
              onClick={() => { setStatusFilter(''); setModeFilter(''); setSearchText(''); setPageIndex(1) }}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {(statusFilter || modeFilter) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {modeFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                Mode: {modeFilter}
                <button onClick={() => setModeFilter('')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-xs text-slate-500 self-center">
              {filteredBatches.length} result{filteredBatches.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-500">Loading batches...</span>
        </div>
      ) : filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => openBatchDetail(batch)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Card Header */}
              <div className={`${statusHeaderColors[batch.batch_status] || 'bg-slate-500'} px-4 pt-4 pb-8`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-base leading-tight line-clamp-2">{batch.name}</h3>
                    {batch.course_name && <p className="text-white/80 text-xs mt-1 font-medium truncate">{batch.course_name}</p>}
                    {batch.manager_name && <p className="text-white/70 text-xs mt-0.5 truncate">{batch.manager_name}</p>}
                  </div>
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 pt-3 pb-3 flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[batch.batch_status] || 'bg-slate-100 text-slate-600'}`}>
                    {batch.batch_status || '-'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${modeColors[batch.batch_mode] || 'bg-slate-100 text-slate-600'}`}>
                    {batch.batch_mode === 'online' && <Wifi className="w-3 h-3" />}
                    {batch.batch_mode === 'offline' && <MapPin className="w-3 h-3" />}
                    {batch.batch_mode === 'hybrid' && <Monitor className="w-3 h-3" />}
                    {batch.batch_mode || '-'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[batch.batch_category] || 'bg-slate-100 text-slate-600'}`}>
                    {batch.batch_category || '-'}
                  </span>
                </div>

                <div className="space-y-1.5 mt-1">
                  {batch.faculty_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{batch.faculty_name}</span>
                    </div>
                  )}
                  {batch.batch_time && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{batch.batch_time}</span>
                    </div>
                  )}
                  {(batch.start_date || batch.end_date) && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{formatDate(batch.start_date)} – {formatDate(batch.end_date)}</span>
                    </div>
                  )}
                  {batch.description && (
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{batch.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(batch.id) }}
                  className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(batch) }}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {statusFilter || modeFilter ? 'No batches match the selected filters' : 'No batches found'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {statusFilter || modeFilter ? 'Try changing or clearing the filters.' : 'Add your first batch to get started.'}
          </p>
          {(statusFilter || modeFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setModeFilter('') }}
              className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600">
          Page {pageIndex} — Showing {filteredBatches.length} {filteredBatches.length === 1 ? 'batch' : 'batches'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg">{pageIndex}</span>
          <button
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={filteredBatches.length < pageSize}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-800">
                {editId ? 'Edit Batch' : 'Add New Batch'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Batch Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch Name *</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange} required
                  placeholder="Enter batch name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course *</label>
                  <select name="course_id" value={form.course_id} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={String(c.id)}>{courseLabel(c)}</option>
                    ))}
                  </select>
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager *</label>
                  <select name="manager_id" value={form.manager_id} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select Manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={String(m.id)}>{fullName(m)}</option>
                    ))}
                  </select>
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Faculty *</label>
                  <select name="faculty_id" value={form.faculty_id} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select Faculty</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={String(f.id)}>{fullName(f)}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status *</label>
                  <select name="batch_status" value={form.batch_status} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mode *</label>
                  <select name="batch_mode" value={form.batch_mode} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select name="batch_category" value={form.batch_category} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="weekday">Weekday</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>

                {/* Batch Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch Time *</label>
                  <input
                    type="text" name="batch_time" value={form.batch_time} onChange={handleChange} required
                    placeholder="e.g., 6:00 PM - 9:00 PM"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
                  <input
                    type="date" name="start_date" value={form.start_date} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
                  <input
                    type="date" name="end_date" value={form.end_date} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="Enter batch description"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                  {editId ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteModal}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Delete Batch</h3>
              <p className="text-slate-500 mb-2">Are you sure you want to delete this batch?</p>
              <div className="bg-slate-100 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-slate-600">Batch Name</p>
                <p className="font-semibold text-slate-800">{deleteModal.batch?.name}</p>
              </div>
              <p className="text-sm text-red-500 mb-6">
                This action cannot be undone. All data associated with this batch will be permanently removed.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={closeDeleteModal}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                  Delete Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Batch
