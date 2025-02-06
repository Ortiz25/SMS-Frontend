const PersonalInfo = ({ student }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Full Name
            </label>
            <p className="mt-1">{student?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Date of Birth
            </label>
            <p className="mt-1">{student?.dateOfBirth}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Gender
            </label>
            <p className="mt-1">{student?.gender}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Address
            </label>
            <p className="mt-1">{student?.address}</p>
          </div>
        </div>
      </div>

      {/* Student Type Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Student Type Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Student Type
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                student?.studentType === 'Boarder' 
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {student?.studentType}
              </span>
            </p>
          </div>
          
          {student?.studentType === 'Boarder' && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Hostel Assignment
              </label>
              <p className="mt-1">{student?.hostel}</p>
            </div>
          )}

          {student?.studentType === 'Day Scholar' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Bus Route
                </label>
                <p className="mt-1">{student?.busRoute || 'No Bus Required'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Pickup Point
                </label>
                <p className="mt-1">{student?.pickupPoint || 'N/A'}</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Home Address
            </label>
            <p className="mt-1">{student?.address}</p>
          </div>
        </div>
      </div>

      {/* Guardian Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Guardian Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Guardian Name
            </label>
            <p className="mt-1">{student?.guardian?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Relationship
            </label>
            <p className="mt-1">{student?.guardian?.relationship}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Phone
            </label>
            <p className="mt-1">{student?.guardian?.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Email
            </label>
            <p className="mt-1">{student?.guardian?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;