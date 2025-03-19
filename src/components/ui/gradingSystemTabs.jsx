import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { academicSettingsAPI } from '../../util/academicSettingsApi';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

const GradingSystemsTab = () => {
  const [gradingSystems, setGradingSystems] = useState([]);
  const [showAddGradingForm, setShowAddGradingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form data structure matches the API structure
  const [formData, setFormData] = useState({
    name: '',
    curriculumType: 'CBC',
    level: 'Primary',
    isActive: true,
    gradePoints: [
      { grade: 'A', lowerMark: 80, upperMark: 100, points: 4.0, remarks: 'Excellent' },
      { grade: 'B', lowerMark: 65, upperMark: 79, points: 3.0, remarks: 'Very Good' },
      { grade: 'C', lowerMark: 50, upperMark: 64, points: 2.0, remarks: 'Good' },
      { grade: 'D', lowerMark: 40, upperMark: 49, points: 1.0, remarks: 'Satisfactory' },
      { grade: 'E', lowerMark: 0, upperMark: 39, points: 0.0, remarks: 'Needs Improvement' }
    ]
  });
  
  // Fetch grading systems from API
  const fetchGradingSystems = async () => {
    setLoading(true);
    try {
      const response = await academicSettingsAPI.getGradingSystems();
      if (response.data.success) {
        setGradingSystems(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch grading systems');
      }
    } catch (error) {
      console.error('Error fetching grading systems:', error);
      toast.error('Failed to fetch grading systems');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchGradingSystems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGradePointChange = (index, field, value) => {
    const updatedGradePoints = [...formData.gradePoints];
    
    // For numeric fields, parse as float
    if (field === 'lowerMark' || field === 'upperMark' || field === 'points') {
      updatedGradePoints[index] = {
        ...updatedGradePoints[index],
        [field]: parseFloat(value) || 0
      };
    } else {
      updatedGradePoints[index] = {
        ...updatedGradePoints[index],
        [field]: value
      };
    }
    
    setFormData({ ...formData, gradePoints: updatedGradePoints });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Map form data to match API structure
    const gradingSystemData = {
      name: formData.name,
      curriculumType: formData.curriculumType,
      level: formData.level,
      isActive: formData.isActive,
      gradePoints: formData.gradePoints
    };
    
    setLoading(true);
    try {
      let response;
      
      if (editingId) {
        // Update existing grading system
        response = await academicSettingsAPI.updateGradingSystem(editingId, gradingSystemData);
        if (response.data.success) {
          toast.success('Grading system updated successfully');
        }
      } else {
        // Create new grading system
        response = await academicSettingsAPI.createGradingSystem(gradingSystemData);
        if (response.data.success) {
          toast.success('Grading system created successfully');
        }
      }
      
      // Refresh data and reset form
      fetchGradingSystems();
      setShowAddGradingForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        curriculumType: 'CBC',
        level: 'Primary',
        isActive: true,
        gradePoints: [
          { grade: 'A', lowerMark: 80, upperMark: 100, points: 4.0, remarks: 'Excellent' },
          { grade: 'B', lowerMark: 65, upperMark: 79, points: 3.0, remarks: 'Very Good' },
          { grade: 'C', lowerMark: 50, upperMark: 64, points: 2.0, remarks: 'Good' },
          { grade: 'D', lowerMark: 40, upperMark: 49, points: 1.0, remarks: 'Satisfactory' },
          { grade: 'E', lowerMark: 0, upperMark: 39, points: 0.0, remarks: 'Needs Improvement' }
        ]
      });
    } catch (error) {
      console.error('Error saving grading system:', error);
      toast.error(error.response?.data?.message || 'Failed to save grading system');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (system) => {
    // Map API data structure to form data structure
    setFormData({
      name: system.name,
      curriculumType: system.curriculum_type,
      level: system.level,
      isActive: system.is_active,
      gradePoints: system.grade_points.map(gp => ({
        grade: gp.grade,
        lowerMark: gp.lower_mark,
        upperMark: gp.upper_mark,
        points: gp.points,
        remarks: gp.remarks || ''
      }))
    });
    
    setEditingId(system.id);
    setShowAddGradingForm(true);
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Grading Systems</h2>
            <p className="text-sm text-gray-500">Manage grading scales for different curriculum levels</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                curriculumType: 'CBC',
                level: 'Primary',
                isActive: true,
                gradePoints: [
                  { grade: 'A', lowerMark: 80, upperMark: 100, points: 4.0, remarks: 'Excellent' },
                  { grade: 'B', lowerMark: 65, upperMark: 79, points: 3.0, remarks: 'Very Good' },
                  { grade: 'C', lowerMark: 50, upperMark: 64, points: 2.0, remarks: 'Good' },
                  { grade: 'D', lowerMark: 40, upperMark: 49, points: 1.0, remarks: 'Satisfactory' },
                  { grade: 'E', lowerMark: 0, upperMark: 39, points: 0.0, remarks: 'Needs Improvement' }
                ]
              });
              setShowAddGradingForm(!showAddGradingForm);
            }}
            disabled={loading}
          >
            <Plus size={16} />
            <span>Add Grading System</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Add/Edit Grading System Form */}
        {showAddGradingForm && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Grading System' : 'Add New Grading System'}
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
                    placeholder="e.g. CBC Junior Secondary"
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
                  <label className="block text-sm font-medium mb-1" htmlFor="level">Level</label>
                  <select 
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Pre-Primary">Pre-Primary</option>
                    <option value="Primary">Primary</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="Secondary">Secondary</option>
                  </select>
                </div>
                <div className="flex items-center self-end">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2" 
                  />
                  <label htmlFor="isActive">Active</label>
                </div>
              </div>
              
              {/* Grade Points Section */}
              <h4 className="font-medium mb-2">Grade Points</h4>
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Grade</th>
                      <th className="py-2 px-4 text-left">Lower Mark</th>
                      <th className="py-2 px-4 text-left">Upper Mark</th>
                      <th className="py-2 px-4 text-left">Points</th>
                      <th className="py-2 px-4 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.gradePoints.map((gradePoint, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4">
                          <input 
                            type="text" 
                            className="w-full p-1 border rounded-md" 
                            value={gradePoint.grade}
                            onChange={(e) => handleGradePointChange(index, 'grade', e.target.value)}
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" 
                            className="w-full p-1 border rounded-md" 
                            value={gradePoint.lowerMark}
                            onChange={(e) => handleGradePointChange(index, 'lowerMark', e.target.value)}
                            min="0"
                            max="100"
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" 
                            className="w-full p-1 border rounded-md" 
                            value={gradePoint.upperMark}
                            onChange={(e) => handleGradePointChange(index, 'upperMark', e.target.value)}
                            min="0"
                            max="100"
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" 
                            className="w-full p-1 border rounded-md" 
                            value={gradePoint.points}
                            onChange={(e) => handleGradePointChange(index, 'points', e.target.value)}
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="text" 
                            className="w-full p-1 border rounded-md" 
                            value={gradePoint.remarks}
                            onChange={(e) => handleGradePointChange(index, 'remarks', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                  onClick={() => {
                    setShowAddGradingForm(false);
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
                  {loading ? 'Saving...' : editingId ? 'Update System' : 'Save System'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading state */}
        {loading && !showAddGradingForm && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Grading Systems List */}
        {!loading && (
          <div className="space-y-6">
            {gradingSystems.map(system => (
              <div key={system.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{system.name}</h3>
                  <div className="flex items-center">
                    <span className={`mr-3 px-2 py-1 rounded-full text-xs ${
                      system.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {system.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded mr-1"
                      onClick={() => handleEdit(system)}
                      disabled={loading}
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap text-sm text-gray-600 mb-4">
                  <span className="mr-4">Curriculum: {system.curriculum_type}</span>
                  <span>Level: {system.level}</span>
                </div>
                
                {/* Grade Points Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 text-left">Grade</th>
                        <th className="py-2 px-4 text-left">Mark Range</th>
                        <th className="py-2 px-4 text-left">Points</th>
                        <th className="py-2 px-4 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {system.grade_points && system.grade_points.map(gradePoint => (
                        <tr key={gradePoint.id || gradePoint.grade}>
                          <td className="py-2 px-4">{gradePoint.grade}</td>
                          <td className="py-2 px-4">{gradePoint.lower_mark}-{gradePoint.upper_mark}</td>
                          <td className="py-2 px-4">{gradePoint.points}</td>
                          <td className="py-2 px-4">{gradePoint.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {gradingSystems.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                No grading systems found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingSystemsTab;