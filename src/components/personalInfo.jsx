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
