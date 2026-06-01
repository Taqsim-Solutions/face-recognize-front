// ── Mock data for Dashboard demo mode ────────────────────────────
// Mirrors real API response structures exactly

export const mockTodayStats = {
  totalStudents: 12480,
  totalTeachers: 894,
  totalSchools: 21,
  totalCameras: 3,
  onlineCameras: 3,
  offlineCameras: 0,
  errorCameras: 0,
  presentStudents: 10954,
  absentStudents: 1526,
  presentTeachers: 821,
  absentTeachers: 73,
}

export const mockSchoolsNumber = {
  allSchoolsNumber: 21,
  connectedSchoolsNumber: 21,
  teachersCount: 894,
  absentTeachersCount: 73,
}

export const mockWeeklyPerformance = {
  thisWeekPerformance: [
    { date: '2026-05-26', attendedCount: 10120, notAttendedCount: 1480 },
    { date: '2026-05-27', attendedCount: 10340, notAttendedCount: 1260 },
    { date: '2026-05-28', attendedCount: 9980,  notAttendedCount: 1620 },
    { date: '2026-05-29', attendedCount: 10670, notAttendedCount: 930  },
    { date: '2026-05-30', attendedCount: 10954, notAttendedCount: 1526 },
    { date: '2026-05-31', attendedCount: 0,     notAttendedCount: 0    },
    { date: '2026-06-01', attendedCount: 0,     notAttendedCount: 0    },
  ],
  lastWeekPerformance: [
    { date: '2026-05-19', attendedCount: 9800,  notAttendedCount: 1760 },
    { date: '2026-05-20', attendedCount: 10100, notAttendedCount: 1460 },
    { date: '2026-05-21', attendedCount: 10250, notAttendedCount: 1310 },
    { date: '2026-05-22', attendedCount: 9950,  notAttendedCount: 1610 },
    { date: '2026-05-23', attendedCount: 10450, notAttendedCount: 1110 },
    { date: '2026-05-24', attendedCount: 0,     notAttendedCount: 0    },
    { date: '2026-05-25', attendedCount: 0,     notAttendedCount: 0    },
  ]
}

export const mockSchoolDetails = [
  { id: 1,  name: '1-maktab',  totalStudents: 680,  attendedStudentsCount: 624, notAttendedStudentsCount: 56,  absentsCount: 56,  percentage: '91.8', attendedPercentage: '91.8' },
  { id: 2,  name: '2-maktab',  totalStudents: 720,  attendedStudentsCount: 648, notAttendedStudentsCount: 72,  absentsCount: 72,  percentage: '90.0', attendedPercentage: '90.0' },
  { id: 3,  name: '3-maktab',  totalStudents: 590,  attendedStudentsCount: 501, notAttendedStudentsCount: 89,  absentsCount: 89,  percentage: '84.9', attendedPercentage: '84.9' },
  { id: 4,  name: '4-maktab',  totalStudents: 640,  attendedStudentsCount: 538, notAttendedStudentsCount: 102, absentsCount: 102, percentage: '84.1', attendedPercentage: '84.1' },
  { id: 5,  name: '5-maktab',  totalStudents: 510,  attendedStudentsCount: 398, notAttendedStudentsCount: 112, absentsCount: 112, percentage: '78.0', attendedPercentage: '78.0' },
  { id: 6,  name: '6-maktab',  totalStudents: 670,  attendedStudentsCount: 610, notAttendedStudentsCount: 60,  absentsCount: 60,  percentage: '91.0', attendedPercentage: '91.0' },
  { id: 7,  name: '7-maktab',  totalStudents: 480,  attendedStudentsCount: 350, notAttendedStudentsCount: 130, absentsCount: 130, percentage: '72.9', attendedPercentage: '72.9' },
  { id: 8,  name: '8-maktab',  totalStudents: 560,  attendedStudentsCount: 504, notAttendedStudentsCount: 56,  absentsCount: 56,  percentage: '90.0', attendedPercentage: '90.0' },
  { id: 9,  name: '9-maktab',  totalStudents: 730,  attendedStudentsCount: 693, notAttendedStudentsCount: 37,  absentsCount: 37,  percentage: '94.9', attendedPercentage: '94.9' },
  { id: 10, name: '10-maktab', totalStudents: 620,  attendedStudentsCount: 527, notAttendedStudentsCount: 93,  absentsCount: 93,  percentage: '85.0', attendedPercentage: '85.0' },
  { id: 11, name: '11-maktab', totalStudents: 490,  attendedStudentsCount: 421, notAttendedStudentsCount: 69,  absentsCount: 69,  percentage: '85.9', attendedPercentage: '85.9' },
  { id: 12, name: '12-maktab', totalStudents: 700,  attendedStudentsCount: 665, notAttendedStudentsCount: 35,  absentsCount: 35,  percentage: '95.0', attendedPercentage: '95.0' },
]

export const mockClassAttendance = [
  { id: 101, name: '1-A sinf',  totalStudents: 32, attendedStudentsCount: 30, notAttendedStudentsCount: 2,  absentsCount: 2,  percentage: '93.8', attendedPercentage: '93.8' },
  { id: 102, name: '1-B sinf',  totalStudents: 30, attendedStudentsCount: 27, notAttendedStudentsCount: 3,  absentsCount: 3,  percentage: '90.0', attendedPercentage: '90.0' },
  { id: 103, name: '2-A sinf',  totalStudents: 31, attendedStudentsCount: 28, notAttendedStudentsCount: 3,  absentsCount: 3,  percentage: '90.3', attendedPercentage: '90.3' },
  { id: 104, name: '2-B sinf',  totalStudents: 29, attendedStudentsCount: 22, notAttendedStudentsCount: 7,  absentsCount: 7,  percentage: '75.9', attendedPercentage: '75.9' },
  { id: 105, name: '3-A sinf',  totalStudents: 33, attendedStudentsCount: 31, notAttendedStudentsCount: 2,  absentsCount: 2,  percentage: '93.9', attendedPercentage: '93.9' },
  { id: 106, name: '3-B sinf',  totalStudents: 28, attendedStudentsCount: 20, notAttendedStudentsCount: 8,  absentsCount: 8,  percentage: '71.4', attendedPercentage: '71.4' },
  { id: 107, name: '4-A sinf',  totalStudents: 30, attendedStudentsCount: 29, notAttendedStudentsCount: 1,  absentsCount: 1,  percentage: '96.7', attendedPercentage: '96.7' },
  { id: 108, name: '5-A sinf',  totalStudents: 35, attendedStudentsCount: 32, notAttendedStudentsCount: 3,  absentsCount: 3,  percentage: '91.4', attendedPercentage: '91.4' },
  { id: 109, name: '6-A sinf',  totalStudents: 34, attendedStudentsCount: 26, notAttendedStudentsCount: 8,  absentsCount: 8,  percentage: '76.5', attendedPercentage: '76.5' },
  { id: 110, name: '7-A sinf',  totalStudents: 32, attendedStudentsCount: 30, notAttendedStudentsCount: 2,  absentsCount: 2,  percentage: '93.8', attendedPercentage: '93.8' },
  { id: 111, name: '8-A sinf',  totalStudents: 30, attendedStudentsCount: 28, notAttendedStudentsCount: 2,  absentsCount: 2,  percentage: '93.3', attendedPercentage: '93.3' },
  { id: 112, name: '9-A sinf',  totalStudents: 28, attendedStudentsCount: 21, notAttendedStudentsCount: 7,  absentsCount: 7,  percentage: '75.0', attendedPercentage: '75.0' },
  { id: 113, name: '10-A sinf', totalStudents: 26, attendedStudentsCount: 24, notAttendedStudentsCount: 2,  absentsCount: 2,  percentage: '92.3', attendedPercentage: '92.3' },
  { id: 114, name: '11-A sinf', totalStudents: 24, attendedStudentsCount: 20, notAttendedStudentsCount: 4,  absentsCount: 4,  percentage: '83.3', attendedPercentage: '83.3' },
]

export const mockAbsents = [
  { id: 1, firstName: 'Jasur',    lastName: 'Toshmatov',  schoolName: '3-maktab', className: '7-A sinf', studentName: 'Toshmatov Jasur' },
  { id: 2, firstName: 'Malika',   lastName: 'Yusupova',   schoolName: '5-maktab', className: '9-B sinf', studentName: 'Yusupova Malika' },
  { id: 3, firstName: 'Bobur',    lastName: 'Rahimov',    schoolName: '1-maktab', className: '5-A sinf', studentName: 'Rahimov Bobur' },
  { id: 4, firstName: 'Nilufar',  lastName: 'Karimova',   schoolName: '7-maktab', className: '8-B sinf', studentName: 'Karimova Nilufar' },
]

export const mockLateStudents = [
  {
    studentId: 1, firstName: 'Alisher',  lastName: 'Nazarov',   className: '8-A sinf', schoolName: '2-maktab',
    lateCount: 7,
    lateEntries: [
      { date: '2026-05-30', comingTime: '2026-05-30T08:18:00', lateMinutes: 18 },
      { date: '2026-05-29', comingTime: '2026-05-29T08:22:00', lateMinutes: 22 },
      { date: '2026-05-28', comingTime: '2026-05-28T08:12:00', lateMinutes: 12 },
    ]
  },
  {
    studentId: 2, firstName: 'Kamola',   lastName: 'Ergasheva',  className: '6-B sinf', schoolName: '4-maktab',
    lateCount: 5,
    lateEntries: [
      { date: '2026-05-30', comingTime: '2026-05-30T08:35:00', lateMinutes: 35 },
      { date: '2026-05-27', comingTime: '2026-05-27T08:15:00', lateMinutes: 15 },
    ]
  },
  {
    studentId: 3, firstName: 'Sherzod',  lastName: 'Xolmatov',   className: '10-A sinf', schoolName: '9-maktab',
    lateCount: 4,
    lateEntries: [
      { date: '2026-05-29', comingTime: '2026-05-29T08:45:00', lateMinutes: 45 },
      { date: '2026-05-28', comingTime: '2026-05-28T08:20:00', lateMinutes: 20 },
    ]
  },
  {
    studentId: 4, firstName: 'Dilnoza',  lastName: 'Sobirov',    className: '3-A sinf', schoolName: '6-maktab',
    lateCount: 3,
    lateEntries: [
      { date: '2026-05-30', comingTime: '2026-05-30T08:10:00', lateMinutes: 10 },
    ]
  },
  {
    studentId: 5, firstName: 'Umid',     lastName: 'Tursunov',   className: '11-A sinf', schoolName: '12-maktab',
    lateCount: 6,
    lateEntries: [
      { date: '2026-05-30', comingTime: '2026-05-30T08:28:00', lateMinutes: 28 },
      { date: '2026-05-29', comingTime: '2026-05-29T08:33:00', lateMinutes: 33 },
    ]
  },
]

// Realistic face photos from randomuser.me (consistent per seed)
const mockPhotos = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/28.jpg',
  'https://randomuser.me/api/portraits/men/51.jpg',
]

export const mockLiveEvents = [
  { firstName: 'Azizbek',  lastName: 'Mirzayev',   schoolName: '1-maktab', className: '9-A sinf',  attendanceTime: new Date(Date.now() - 1 * 60000).toISOString(),  type: 'entry', photo: mockPhotos[0] },
  { firstName: 'Zulfiya',  lastName: 'Hasanova',   schoolName: '3-maktab', className: '7-B sinf',  attendanceTime: new Date(Date.now() - 3 * 60000).toISOString(),  type: 'entry', photo: mockPhotos[1] },
  { firstName: 'Sardor',   lastName: 'Qodirov',    schoolName: '2-maktab', className: '11-A sinf', attendanceTime: new Date(Date.now() - 6 * 60000).toISOString(),  type: 'exit',  photo: mockPhotos[2] },
  { firstName: 'Mohira',   lastName: 'Umarova',    schoolName: '5-maktab', className: '4-A sinf',  attendanceTime: new Date(Date.now() - 9 * 60000).toISOString(),  type: 'entry', photo: mockPhotos[3] },
  { firstName: 'Firdavs',  lastName: 'Normatov',   schoolName: '8-maktab', className: '6-A sinf',  attendanceTime: new Date(Date.now() - 14 * 60000).toISOString(), type: 'entry', photo: mockPhotos[4] },
]
