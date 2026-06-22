import api from '@/api'

const url = '/api/reports/monthly'

export interface ReportDay {
  date: string
  status: 'present' | 'late' | 'excused' | 'absent' | 'restday'
  comingTime: string | null
}

export interface MonthlyReport {
  studentId: number
  studentName: string
  className: string | null
  year: number
  month: number
  schoolDays: number
  present: number
  late: number
  excused: number
  absent: number
  attendancePercent: number
  days: ReportDay[]
}

export const fetchClassMonthlyReport = async (classId: number, year: number, month: number) => {
  return await api<{ result: MonthlyReport[] }>(`${url}/class/${classId}`, {
    params: { year, month }
  })
}

export const fetchStudentMonthlyReport = async (studentId: number, year: number, month: number) => {
  return await api<{ result: MonthlyReport }>(`${url}/student/${studentId}`, {
    params: { year, month }
  })
}
