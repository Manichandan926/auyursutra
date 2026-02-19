export const patients = [
  { 
    id: 1, 
    name: 'Raj Sharma', 
    age: 45, 
    gender: 'Male', 
    dosha: 'Vata', 
    therapyType: 'Abhyanga', 
    practitioner: 'Priya Singh', 
    doctor: 'Dr. Raj Kumar',
    joinDate: '2026-01-15',
    status: 'Active', 
    progress: 65,
    mobile: '+91 98765 43210',
    email: 'raj.sharma@example.com'
  },
  { 
    id: 2, 
    name: 'Priya Dutta', 
    age: 32, 
    gender: 'Female', 
    dosha: 'Pitta', 
    therapyType: 'Shirodhara', 
    practitioner: 'Ravi Kumar', 
    doctor: 'Dr. Raj Kumar',
    joinDate: '2026-02-01',
    status: 'Active', 
    progress: 45,
    mobile: '+91 98765 43211',
    email: 'priya.dutta@example.com' 
  },
  { 
    id: 3, 
    name: 'Arjun Singh', 
    age: 55, 
    gender: 'Male', 
    dosha: 'Kapha', 
    therapyType: 'Nasya', 
    practitioner: 'Sofia Martinez', 
    doctor: 'Dr. Anjali Gupta',
    joinDate: '2025-12-10',
    status: 'Active', 
    progress: 80,
    mobile: '+91 98765 43212',
    email: 'arjun.singh@example.com' 
  },
  { 
    id: 4, 
    name: 'Maya Rao', 
    age: 28, 
    gender: 'Female', 
    dosha: 'Vata-Pitta', 
    therapyType: 'Abhyanga', 
    practitioner: 'Priya Singh', 
    doctor: 'Dr. Raj Kumar',
    joinDate: '2026-01-20',
    status: 'Completed', 
    progress: 100,
    mobile: '+91 98765 43213',
    email: 'maya.rao@example.com' 
  },
  { 
    id: 5, 
    name: 'Vikram Das', 
    age: 60, 
    gender: 'Male', 
    dosha: 'Kapha-Pitta', 
    therapyType: 'Panchakarma', 
    practitioner: 'Rohan Das', 
    doctor: 'Dr. Anjali Gupta',
    joinDate: '2026-02-10',
    status: 'Active', 
    progress: 55,
    mobile: '+91 98765 43214',
    email: 'vikram.das@example.com' 
  }
];

export const therapies = [
  { id: 1, patientId: 1, name: 'Abhyanga', room: '101', frequency: 'Daily', progress: 65, startDate: '2026-02-01', duration: 45 },
  { id: 2, patientId: 1, name: 'Shirodhara', room: '102', frequency: 'Alternate Days', progress: 45, startDate: '2026-02-05', duration: 60 },
  { id: 3, patientId: 2, name: 'Shirodhara', room: '102', frequency: 'Daily', progress: 45, startDate: '2026-02-10', duration: 60 },
  { id: 4, patientId: 3, name: 'Nasya', room: '103', frequency: 'Weekly', progress: 80, startDate: '2026-01-15', duration: 30 }
];

export const therapySessions = [
  { id: 1, patientId: 1, date: '2026-02-13', session: 'Abhyanga', time: '10:00 AM', room: '101', status: 'Completed', practitioner: 'Priya Singh', notes: 'Patient felt significant relief in lower back.' },
  { id: 2, patientId: 1, date: '2026-02-14', session: 'Shirodhara', time: '2:00 PM', room: '102', status: 'Scheduled', practitioner: 'Priya Singh', notes: '' },
  { id: 3, patientId: 1, date: '2026-02-15', session: 'Abhyanga', time: '10:00 AM', room: '101', status: 'Scheduled', practitioner: 'Priya Singh', notes: '' },
  { id: 4, patientId: 1, date: '2026-02-16', session: 'Nasya', time: '11:00 AM', room: '103', status: 'Scheduled', practitioner: 'Ravi Kumar', notes: '' },
  { id: 5, patientId: 1, date: '2026-02-17', session: 'Abhyanga', time: '3:00 PM', room: '101', status: 'Scheduled', practitioner: 'Priya Singh', notes: '' }
];

export const notifications = [
  { id: 1, userId: 1, type: 'session', message: 'Upcoming: Shirodhara session tomorrow at 2:00 PM in Room 102', time: '2 hours ago', read: false },
  { id: 2, userId: 1, type: 'progress', message: 'Your therapy progress has reached 65%! Great progress!', time: '1 day ago', read: true },
  { id: 3, userId: 1, type: 'reminder', message: 'Remember to follow Ayurvedic diet guidelines', time: '2 days ago', read: true },
  { id: 4, userId: 1, type: 'appointment', message: 'Your next doctor consultation is on 2026-02-20', time: '3 days ago', read: true }
];

export const progressData = [
  { date: '2026-02-01', progress: 15, energy: 5, pain: 8, digestion: 4, sleep: 6 },
  { date: '2026-02-05', progress: 30, energy: 6, pain: 6, digestion: 5, sleep: 7 },
  { date: '2026-02-10', progress: 50, energy: 7, pain: 4, digestion: 6, sleep: 8 },
  { date: '2026-02-13', progress: 65, energy: 7, pain: 3, digestion: 6, sleep: 8 }
];

export const staff = {
  doctors: [
    { id: 'd1', name: 'Dr. Raj Kumar', specialty: 'Panchakarma' },
    { id: 'd2', name: 'Dr. Anjali Gupta', specialty: 'Kayachikitsa' }
  ],
  practitioners: [
    { id: 'p1', name: 'Priya Singh' },
    { id: 'p2', name: 'Ravi Kumar' },
    { id: 'p3', name: 'Sofia Martinez' },
    { id: 'p4', name: 'Rohan Das' }
  ]
};
