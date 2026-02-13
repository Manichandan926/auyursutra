/**
 * Seed data for demo and development
 */
module.exports = {
  doctors: [
    {
      username: 'doctor1',
      name: 'Dr. Vaidya Sharma',
      role: 'DOCTOR',
      specialty: 'Panchakarma',
      contact: '9876543210',
      email: 'sharma@ayursutra.com',
      language: 'en'
    },
    {
      username: 'doctor2',
      name: 'Dr. Desai Vaidya',
      role: 'DOCTOR',
      specialty: 'Internal Medicine',
      contact: '9876543211',
      email: 'desai@ayursutra.com',
      language: 'hi'
    }
  ],

  practitioners: [
    {
      username: 'prac1',
      name: 'Therapist Ravi Kumar',
      role: 'PRACTITIONER',
      specialty: 'Massage & Detox',
      contact: '9876543220',
      email: 'ravi@ayursutra.com',
      language: 'en'
    },
    {
      username: 'prac2',
      name: 'Therapist Priya Singh',
      role: 'PRACTITIONER',
      specialty: 'Yoga & Wellness',
      contact: '9876543221',
      email: 'priya@ayursutra.com',
      language: 'hi'
    },
    {
      username: 'prac3',
      name: 'Therapist Anil Patel',
      role: 'PRACTITIONER',
      specialty: 'Herbal Treatments',
      contact: '9876543222',
      email: 'anil@ayursutra.com',
      language: 'en'
    }
  ],

  reception: [
    {
      username: 'rec1',
      name: 'Receptionist Ananya',
      role: 'RECEPTION',
      contact: '9876543230',
      email: 'ananya@ayursutra.com',
      language: 'en'
    },
    {
      username: 'rec2',
      name: 'Receptionist Kavya',
      role: 'RECEPTION',
      contact: '9876543231',
      email: 'kavya@ayursutra.com',
      language: 'hi'
    }
  ],

  patients: [
    {
      name: 'Amit Kumar',
      age: 40,
      gender: 'Male',
      phone: '9876543300',
      email: 'amit@example.com',
      address: 'Mumbai, India',
      dosha: 'Pitta',
      preferredLanguage: 'hi',
      abha: '1234567890123456',
      medicalHistory: 'Digestive issues, high stress'
    },
    {
      name: 'Neha Patel',
      age: 35,
      gender: 'Female',
      phone: '9876543301',
      email: 'neha@example.com',
      address: 'Delhi, India',
      dosha: 'Vata',
      preferredLanguage: 'en',
      abha: '1234567890123457',
      medicalHistory: 'Chronic pain, anxiety'
    },
    {
      name: 'Rajesh Verma',
      age: 55,
      gender: 'Male',
      phone: '9876543302',
      email: 'rajesh@example.com',
      address: 'Bangalore, India',
      dosha: 'Kapha',
      preferredLanguage: 'en',
      abha: '1234567890123458',
      medicalHistory: 'Metabolic syndrome'
    },
    {
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      phone: '9876543303',
      email: 'priya@example.com',
      address: 'Pune, India',
      dosha: 'Tridosha',
      preferredLanguage: 'hi',
      abha: '1234567890123459',
      medicalHistory: 'Preventive wellness'
    }
  ],

  therapies: [
    {
      type: 'Virechana',
      phase: 'PRADHANAKARMA',
      startDate: '2026-02-20',
      durationDays: 7,
      room: 'R-101',
      herbs: ['Castor Oil', 'Triphala', 'Ginger'],
      notes: 'Digestive cleansing therapy'
    },
    {
      type: 'Basti',
      phase: 'PRADHANAKARMA',
      startDate: '2026-02-22',
      durationDays: 14,
      room: 'R-102',
      herbs: ['Sesame oil', 'Ashwagandha', 'Brahmi'],
      notes: 'Vata balancing therapy'
    },
    {
      type: 'Abhyanga-Swedam',
      phase: 'PURVAKARMA',
      startDate: '2026-02-23',
      durationDays: 5,
      room: 'R-103',
      herbs: ['Medicated oils', 'Herbal paste'],
      notes: 'Oil massage and steam therapy'
    },
    {
      type: 'Nasya',
      phase: 'PRADHANAKARMA',
      startDate: '2026-02-25',
      durationDays: 7,
      room: 'R-104',
      herbs: ['Medicated nasal oils'],
      notes: 'Head and sinus therapy'
    }
  ]
};
