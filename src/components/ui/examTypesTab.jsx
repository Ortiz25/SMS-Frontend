import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { academicSettingsAPI } from '../../util/academicSettingsApi';
import { toast } from 'react-toastify'; 

const ExamTypesTab = () => {
  const [examTypes, setExamTypes] = useState([]);
  const [gradingSystems, setGradingSystems] = useState([]);
  const [showAddExamTypeForm, setShowAddExamTypeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form data structure matches the API structure
  const [formData, setFormData] = useState({
    name: '',
    curriculumType: 'CBC',
    category: 'CAT',
    weightPercentage: 40,
    isNationalExam: false,
    gradingSystemId: ''
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both exam types and grading systems in parallel
        const [examTypesResponse, gradingSystemsResponse] = await Promise.all([
          academicSettingsAPI.getExamTypes(),
          academicSettingsAPI.getGradingSystems()
        ]);
        
        if (examTypesResponse.data.success) {
          setExamTypes(examTypesResponse.data.data);
        } else {
          toast.error(examTypesResponse.data.message || 'Failed to fetch exam types');
        }
        
        if (gradingSystemsResponse.data.success) {
          setGradingSystems(gradingSystemsResponse.data.data);
        } else {
          toast.error(gradingSystemsResponse.data.message || 'Failed to fetch grading systems');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch required data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'weightPercentage') {
      // Ensure weight percentage is a number
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    // Reset grading system dropdown when curriculum type changes
    if (name === 'curriculumType') {
      setFormData({
        ...formData,
        curriculumType: value,
        gradingSystemId: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format the data for API
    const examTypeData = {
      name: formData.name,
      curriculumType: formData.curriculumType,
      category: formData.category,
      weightPercentage: formData.weightPercentage,
      isNationalExam: formData.isNationalExam,
      gradingSystemId: formData.gradingSystemId
    };
    
    setLoading(true);
    try {
      let response;
      
      if (editingId) {
        // Update existing exam type
        response = await academicSettingsAPI.updateExamType(editingId, examTypeData);
        if (response.data.success) {
          toast.success('Exam type updated successfully');
        }
      } else {
        // Create new exam type
        response = await academicSettingsAPI.createExamType(examTypeData);
        if (response.data.success) {
          toast.success('Exam type created successfully');
        }
      }
      
      // Refresh data and reset form
      const refreshResponse = await academicSettingsAPI.getExamTypes();
      if (refreshResponse.data.success) {
        setExamTypes(refreshResponse.data.data);
      }
      
      setShowAddExamTypeForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        curriculumType: 'CBC',
        category: 'CAT',
        weightPercentage: 40,
        isNationalExam: false,
        gradingSystemId: ''
      });
    } catch (error) {
      console.error('Error saving exam type:', error);
      toast.error(error.response?.data?.message || 'Failed to save exam type');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (examType) => {
    // Map API data to form format
    setFormData({
      name: examType.name,
      curriculumType: examType.curriculum_type,
      category: examType.category,
      weightPercentage: examType.weight_percentage,
      isNationalExam: examType.is_national_exam,
      gradingSystemId: examType.grading_system_id ? examType.grading_system_id.toString() : ''
    });
    
    setEditingId(examType.id);
    setShowAddExamTypeForm(true);
  };

  // Filter grading systems by curriculum type for the dropdown
  const filteredGradingSystems = gradingSystems.filter(
    system => system.curriculum_type === formData.curriculumType && system.is_active
  );

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Exam Types</h2>
            <p className="text-sm text-gray-500">Configure examination categories and weighting</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                curriculumType: 'CBC',
                category: 'CAT',
                weightPercentage: 40,
                isNationalExam: false,
                gradingSystemId: ''
              });
              setShowAddExamTypeForm(!showAddExamTypeForm);
            }}
            disabled={loading}
          >
            <Plus size={16} />
            <span>Add Exam Type</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Add/Edit Exam Type Form */}
        {showAddExamTypeForm && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Exam Type' : 'Add New Exam Type'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    placeholder="e.g. Mid Term Exam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="curriculumType">Curriculum Type</label>
                  <select 
                    id="curriculumType"
                    name="curriculumType"
                    value={formData.curriculumType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="CBC">CBC</option>
                    <option value="844">844</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="category">Category</label>
                  <select 
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="CAT">CAT</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="End Term">End Term</option>
                    <option value="Project">Project</option>
                    <option value="National Exam">National Exam</option>
                    <option value="KCPE">KCPE</option>
                    <option value="KCSE">KCSE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="weightPercentage">Weight Percentage</label>
                  <input 
                    type="number" 
                    id="weightPercentage"
                    name="weightPercentage"
                    value={formData.weightPercentage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    placeholder="e.g. 40"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="gradingSystemId">Grading System</label>
                  <select 
                    id="gradingSystemId"
                    name="gradingSystemId"
                    value={formData.gradingSystemId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Grading System</option>
                    {filteredGradingSystems.map(system => (
                      <option key={system.id} value={system.id}>
                        {system.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center self-end">
                  <input 
                    type="checkbox" 
                    id="isNationalExam"
                    name="isNationalExam"
                    checked={formData.isNationalExam}
                    onChange={handleInputChange}
                    className="mr-2" 
                  />
                  <label htmlFor="isNationalExam">National Examination</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                  onClick={() => {
                    setShowAddExamTypeForm(false);
                    setEditingId(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Exam Type' : 'Save Exam Type'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading state */}
        {loading && !showAddExamTypeForm && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Exam Types Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Curriculum</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Weight</th>
                  <th className="py-3 px-4 text-left">Grading System</th>
                  <th className="py-3 px-4 text-left">National Exam</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {examTypes.map(examType => (
                  <tr key={examType.id}>
                    <td className="py-3 px-4">{examType.name}</td>
                    <td className="py-3 px-4">{examType.curriculum_type}</td>
                    <td className="py-3 px-4">{examType.category}</td>
                    <td className="py-3 px-4">{examType.weight_percentage}%</td>
                    <td className="py-3 px-4">{examType.grading_system_name || 'None'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        examType.is_national_exam ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {examType.is_national_exam ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleEdit(examType)}
                          disabled={loading}
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {examTypes.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                      No exam types found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h4 className="font-medium mb-2">Notes:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Exam types determine how assessments are categorized and weighted</li>
            <li>Each exam type must be linked to a grading system from the same curriculum</li>
            <li>Weight percentages determine how much each exam contributes to final grades</li>
            <li>National exams like KCPE and KCSE have special grading considerations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExamTypesTab;