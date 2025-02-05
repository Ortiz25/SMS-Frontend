import { AlertTriangle } from 'lucide-react';

const MedicalInfo = ({ student }) => {
  return (
    <div className="space-y-6">
      {/* Medical Alert */}
      {student?.medicalConditions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-800">Medical Conditions</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">{student.medicalConditions}</p>
        </div>
      )}

      {/* Medical Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Blood Group</label>
            <p className="mt-1">{student?.bloodGroup || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Allergies</label>
            <p className="mt-1">{student?.allergies || 'None reported'}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500">Primary Contact</label>
            <p className="mt-1 font-medium">{student?.emergencyContact?.primary?.name}</p>
            <p className="text-sm text-gray-600">{student?.emergencyContact?.primary?.phone}</p>
            <p className="text-sm text-gray-600">{student?.emergencyContact?.primary?.relationship}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500">Secondary Contact</label>
            <p className="mt-1 font-medium">{student?.emergencyContact?.secondary?.name}</p>
            <p className="text-sm text-gray-600">{student?.emergencyContact?.secondary?.phone}</p>
            <p className="text-sm text-gray-600">{student?.emergencyContact?.secondary?.relationship}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalInfo;