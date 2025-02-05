// utils/conflictDetection.js

// Check for time overlap between exams
export const checkTimeConflict = (exam1, exam2) => {
    const start1 = new Date(`${exam1.date}T${exam1.startTime}`);
    const end1 = new Date(start1.getTime() + exam1.duration * 60 * 60 * 1000);
    
    const start2 = new Date(`${exam2.date}T${exam2.startTime}`);
    const end2 = new Date(start2.getTime() + exam2.duration * 60 * 60 * 1000);
  
    return start1 < end2 && end1 > start2;
  };
  
  // Check for room conflicts
  export const checkRoomConflict = (newExam, existingExams) => {
    return existingExams.filter(exam => 
      exam.room === newExam.room && 
      exam.date === newExam.date &&
      checkTimeConflict(newExam, exam)
    );
  };
  
  // Check for invigilator conflicts
  export const checkInvigilatorConflict = (newExam, existingExams) => {
    return existingExams.filter(exam => 
      exam.invigilator === newExam.invigilator && 
      exam.date === newExam.date &&
      checkTimeConflict(newExam, exam)
    );
  };
  
  // Check for class conflicts (same class having multiple exams)
  export const checkClassConflict = (newExam, existingExams) => {
    return existingExams.filter(exam => 
      exam.class === newExam.class && 
      exam.date === newExam.date &&
      checkTimeConflict(newExam, exam)
    );
  };


  // utils/scheduleConflicts.js

export const checkScheduleConflicts = (newSchedule, existingSchedule, originalSchedule = null) => {
    const conflicts = [];
  
    // Get all classes for the same time slot
    const timeSlot = existingSchedule[newSchedule.day].find(
      slot => slot.time === newSchedule.time
    );
    
    if (!timeSlot) return conflicts;
  
    // Filter out the original schedule if we're editing
    const otherClasses = timeSlot.classes.filter(cls => {
      if (!originalSchedule) return true;
      return !(cls.class === originalSchedule.class && 
               cls.teacher === originalSchedule.teacher);
    });
  
    // Check for class conflicts (same class can't have two subjects at once)
    const classConflict = otherClasses.find(cls => cls.class === newSchedule.class);
    if (classConflict) {
      conflicts.push({
        type: 'class',
        message: `${newSchedule.class} already has ${classConflict.subject} at this time`
      });
    }
  
    // Check for teacher conflicts (teacher can't be in two places)
    const teacherConflict = otherClasses.find(cls => cls.teacher === newSchedule.teacher);
    if (teacherConflict) {
      conflicts.push({
        type: 'teacher',
        message: `${newSchedule.teacher} is already teaching ${teacherConflict.class} at this time`
      });
    }
  
    // Check for room conflicts (room can't have two classes)
    const roomConflict = otherClasses.find(cls => cls.room === newSchedule.room);
    if (roomConflict) {
      conflicts.push({
        type: 'room',
        message: `${newSchedule.room} is already occupied by ${roomConflict.class} at this time`
      });
    }
  
    // Check teacher subject qualification
    const teacher = teachers.find(t => t.name === newSchedule.teacher);
    if (teacher && !teacher.subjects.includes(newSchedule.subject)) {
      conflicts.push({
        type: 'qualification',
        message: `${newSchedule.teacher} does not teach ${newSchedule.subject}`
      });
    }
  
    return conflicts;
  };