// scheduleData.js
export const teachers = [
    {
      id: 1,
      name: 'Mr. John Doe',
      subjects: ['Mathematics', 'Physics'],
      color: 'bg-blue-50 border-blue-100 text-blue-700'
    },
    {
      id: 2,
      name: 'Mrs. Sarah Smith',
      subjects: ['English', 'Literature'],
      color: 'bg-green-50 border-green-100 text-green-700'
    },
    {
      id: 3,
      name: 'Mr. David Wilson',
      subjects: ['Chemistry', 'Biology'],
      color: 'bg-purple-50 border-purple-100 text-purple-700'
    }
  ];
  
  export const classes = [
    { id: 'form1', name: 'Form 1' },
    { id: 'form2', name: 'Form 2' },
    { id: 'form3', name: 'Form 3' },
    { id: 'form4', name: 'Form 4' }
  ];
  
  export const weeklySchedule = {
    'Monday': [
      {
        time: '8:00 AM',
        classes: [
          { class: 'Form 1', subject: 'Mathematics', teacher: 'Mr. John Doe', room: 'Room 101' },
          { class: 'Form 2', subject: 'English', teacher: 'Mrs. Sarah Smith', room: 'Room 102' },
          { class: 'Form 3', subject: 'Chemistry', teacher: 'Mr. David Wilson', room: 'Lab 1' }
        ]
      },
      {
        time: '9:00 AM',
        classes: [
          { class: 'Form 4', subject: 'Physics', teacher: 'Mr. John Doe', room: 'Lab 2' },
          { class: 'Form 1', subject: 'English', teacher: 'Mrs. Sarah Smith', room: 'Room 101' },
          { class: 'Form 2', subject: 'Biology', teacher: 'Mr. David Wilson', room: 'Lab 1' }
        ]
      },
      // Add more time slots...
    ],
    'Tuesday': [
      // Similar structure for other days...
    ]
  };
  
  // Generate full schedule programmatically
  export const generateFullSchedule = () => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
      '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];
  
    const schedule = {};
  
    weekDays.forEach(day => {
      schedule[day] = timeSlots.map(time => ({
        time,
        classes: generateClassesForTimeSlot()
      }));
    });
  
    return schedule;
  };
  
  const generateClassesForTimeSlot = () => {
    // Randomly assign teachers to different classes
    const classAssignments = [];
    classes.forEach(classGroup => {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const subject = teacher.subjects[Math.floor(Math.random() * teacher.subjects.length)];
      
      // 70% chance of having a class in this slot
      if (Math.random() < 0.7) {
        classAssignments.push({
          class: classGroup.name,
          subject,
          teacher: teacher.name,
          room: `Room ${101 + Math.floor(Math.random() * 4)}`,
          color: teacher.color
        });
      }
    });
    
    return classAssignments;
  };