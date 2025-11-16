import api from './api'
import { User } from './authService'

export interface Job {
  id: string
  title: string
  description: string
  category: string
  location: string
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'gig'
  salary?: string
  contactPhone: string
  contactEmail?: string
  employer?: User
  employer_id: string
  status: 'active' | 'closed' | 'filled'
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  success: boolean
  count: number
  total: number
  pagination: {
    page: number
    limit: number
    pages: number
  }
  data: Job[]
}

export interface JobResponse {
  success: boolean
  data: Job
  message?: string
}

export interface JobFilters {
  page?: number
  limit?: number
  category?: string
  location?: string
  jobType?: string
  status?: string
}

export interface CreateJobData {
  title: string
  description: string
  category: string
  location: string
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'gig'
  salary?: string
  contactPhone: string
  contactEmail?: string
}

const jobService = {
  // Get all jobs with filters
  getJobs: async (filters?: JobFilters): Promise<JobListResponse> => {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get<JobListResponse>(`/jobs?${params.toString()}`)
    return response.data
  },

  // Get single job by ID
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get<JobResponse>(`/jobs/${id}`)
    return response.data.data
  },

  // Get user's jobs
  getUserJobs: async (userId: string, page = 1, limit = 12): Promise<JobListResponse> => {
    const response = await api.get<JobListResponse>(`/jobs/user/${userId}`, {
      params: { page, limit }
    })
    return response.data
  },

  // Create new job
  createJob: async (jobData: CreateJobData): Promise<Job> => {
    const response = await api.post<JobResponse>('/jobs', jobData)
    return response.data.data
  },

  // Update job
  updateJob: async (id: string, jobData: Partial<CreateJobData>): Promise<Job> => {
    const response = await api.put<JobResponse>(`/jobs/${id}`, jobData)
    return response.data.data
  },

  // Delete job
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`)
  },

  // Update job status
  updateJobStatus: async (id: string, status: 'active' | 'closed' | 'filled'): Promise<Job> => {
    const response = await api.patch<JobResponse>(`/jobs/${id}/status`, { status })
    return response.data.data
  }
}

export default jobService
