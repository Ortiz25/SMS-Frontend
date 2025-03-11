import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ScheduleExamModal = ({
  isOpen,
  onClose,
  onSubmit,
  examinations,
  examTypes,
  classes,
  rooms,
  academicSessionId
}) => {
  const initialState = {
    examinationId: "",
    examinationName: "",
    examTypeId: "",
    subjectId: "",
    classId: "",
    examDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    supervisorId: "",
    totalMarks: "100",
    passingMarks: "40",
    startDate: "",
    endDate: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isCreatingNewExam, setIsCreatingNewExam] = useState(false);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setErrors({});
      setIsCreatingNewExam(false);
      // Fetch subjects and teachers when the modal opens
      fetchSubjectsAndTeachers();
    }
  }, [isOpen, academicSessionId]);

  const fetchSubjectsAndTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch subjects
      const subjectsResponse = await fetch('http://localhost:5010/api/helpers/subjects', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
      
      const subjectsData = await subjectsResponse.json();
      console.log(subjectsData)
      setSubjects(subjectsData.data);
      
      // Fetch teachers
      const teachersResponse = await fetch('http://localhost:5010/api/teachers', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!teachersResponse.ok) throw new Error('Failed to fetch teachers');
      
      const teachersData = await teachersResponse.json();
      console.log(teachersData.data)
      setTeachers(teachersData.data);
    } catch (error) {
      console.error('Error fetching subjects and teachers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for examination selection
    if (name === 'examinationId' && value) {
      if (value === 'new') {
        setIsCreatingNewExam(true);
        setFormData({
          ...formData,
          examinationId: "",
          examinationName: "",
          examTypeId: "",
          startDate: "",
          endDate: ""
        });
      } else {
        const selectedExam = examinations.find(exam => exam.id.toString() === value);
        if (selectedExam) {
          setIsCreatingNewExam(false);
          setFormData({
            ...formData,
            examinationId: value,
            examTypeId: selectedExam.exam_type_id.toString(),
            startDate: selectedExam.start_date,
            endDate: selectedExam.end_date
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isCreatingNewExam) {
      if (!formData.examinationName) newErrors.examinationName = "Examination name is required";
      if (!formData.examTypeId) newErrors.examTypeId = "Exam type is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
    } else {
      if (!formData.examinationId) newErrors.examinationId = "Please select an examination";
    }
    
    if (!formData.subjectId) newErrors.subjectId = "Subject is required";
    if (!formData.classId) newErrors.classId = "Class is required";
    if (!formData.examDate) newErrors.examDate = "Exam date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    
    // Validate start time is before end time
    if (formData.startTime && formData.endTime) {
      const start = formData.startTime;
      const end = formData.endTime;
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    // Validate exam date is within examination period
    if (formData.examDate && formData.startDate && formData.endDate) {
      const examDate = new Date(formData.examDate);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (examDate < startDate || examDate > endDate) {
        newErrors.examDate = "Exam date must be within the examination period";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule New Exam</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Examination Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Examination Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Examination
                  </label>
                  <select
                    name="examinationId"
                    value={formData.examinationId}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${errors.examinationId ? "border-red-500" : ""}`}
                  >
                    <option value="">Select Examination</option>
                    {examinations.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name} ({new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()})
                      </option>
                    ))}
                    <option value="new">+ Create New Examination</option>
                  </select>
                  {errors.examinationId && <p className="text-red-500 text-xs mt-1">{errors.examinationId}</p>}
                </div>

                {isCreatingNewExam && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Examination Name
                      </label>
                      <input
                        type="text"
                        name="examinationName"
                        value={formData.examinationName}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg ${errors.examinationName ? "border-red-500" : ""}`}
                        placeholder="e.g., End Term Examination Term 1 2023"
                      />
                      {errors.examinationName && <p className="text-red-500 text-xs mt-1">{errors.examinationName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exam Type
                      </label>
                      <select
                        name="examTypeId"
                        value={formData.examTypeId}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-lg ${errors.examTypeId ? "border-red-500" : ""}`}
                      >
                        <option value="">Select Exam Type</option>
                        {examTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name} ({type.category})
                          </option>
                        ))}
                      </select>
                      {errors.examTypeId && <p className="text-red-500 text-xs mt-1">{errors.examTypeId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={`w-full p-2 border rounded-lg ${errors.startDate ? "border-red-500" : ""}`}
                        />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className={`w-full p-2 border rounded-lg ${errors.endDate ? "border-red-500" : ""}`}
                          min={formData.startDate}
                        />
                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Exam Schedule Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Schedule Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg ${errors.subjectId ? "border-red-500" : ""}`}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                    {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg ${errors.classId ? "border-red-500" : ""}`}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${errors.examDate ? "border-red-500" : ""}`}
                    min={formData.startDate || ""}
                    max={formData.endDate || ""}
                  />
                  {errors.examDate && <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg ${errors.startTime ? "border-red-500" : ""}`}
                    />
                    {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg ${errors.endTime ? "border-red-500" : ""}`}
                    />
                    {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${errors.venue ? "border-red-500" : ""}`}
                  >
                    <option value="">Select Venue</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.room_number}>
                        {room.name || room.room_number} ({room.capacity} capacity)
                      </option>
                    ))}
                  </select>
                  {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor (Optional)
                  </label>
                  <select
                    name="supervisorId"
                    value={formData.supervisorId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select Supervisor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max={formData.totalMarks}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Exam
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleExamModal;