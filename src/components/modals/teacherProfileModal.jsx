import {
  Briefcase,
  Users,
  BookOpen,
  Award,
  Edit,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { extractDate } from "../../util/helperFunctions";
import { redirect } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const EditTeacherModal = ({ teacher, isOpen, onClose, onSave }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: teacher?.name || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    position: teacher?.position || "",
    department: teacher?.department || "",
    employmentStatus: teacher?.employmentStatus || "",
    subjects: teacher?.subjects || [],
    qualifications: teacher?.qualifications || [],
  });

  const [subjects, updatedSubjects] = useState();
  const [departments, updatedDepartments] = useState([]);

  useEffect(() => {
    const url = "/backend/api/helpers/reference-data";
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        updatedSubjects(result.data.subjects); // Set the subjects state
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          "/backend/api/inventory/departments",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        updatedDepartments(result);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchData();
    fetchDepartments();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: teacher?.id });
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Teacher Information
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position*
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select position</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Senior Teacher">Senior Teacher</option>
                      <option value="Head of Department">
                        Head of Department
                      </option>
                      <option value="Deputy Principal">Deputy Principal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department*
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        handleChange("department", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Status*
                    </label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) =>
                        handleChange("employmentStatus", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subjects
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                      {[
                        ...new Set(
                          (subjects || [])
                            .filter(
                              (s) =>
                                s.curriculum_type === "844" ||
                                s.curriculum_type === "CBC" ||
                                s.level === "Secondary"
                            )
                            .map((s) => `${s.name}`)
                        ),
                      ]
                        .sort()
                        .map((subject) => (
                          <label
                            key={subject}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subjects.includes(subject)}
                              onChange={(e) => {
                                const updatedSubjects = e.target.checked
                                  ? [...formData.subjects, subject]
                                  : formData.subjects.filter(
                                      (s) => s !== subject
                                    );
                                handleChange("subjects", updatedSubjects);
                              }}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">
                              {subject}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const DeleteConfirmationModal = ({
  teacher,
  isOpen,
  onClose,
  onConfirm,
}) => (
  <div
    className={`fixed inset-0 z-50 ${
      isOpen ? "pointer-events-auto" : "pointer-events-none"
    }`}
  >
    <div
      className="fixed inset-0 bg-black opacity-50 transition-opacity"
      onClick={onClose}
    />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="h-12 w-12" />
        </div>

        <h2 className="text-xl font-bold text-center mb-2">
          Delete Teacher Record
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete {teacher?.name}'s record? This action
          cannot be undone.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(teacher.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const ViewTeacherModal = ({ teacher, isOpen, onClose }) => (
  <div
    className={`fixed inset-0 z-50 ${
      isOpen ? "pointer-events-auto" : "pointer-events-none"
    }`}
  >
    <div
      className="fixed inset-0 bg-black opacity-50 transition-opacity"
      onClick={onClose}
    />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-medium text-blue-600">
                {teacher?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {teacher?.name}
              </h2>
              <p className="text-sm text-gray-500">{teacher?.position}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Email :
                </label>
                <p className="mt-1 text-gray-500">{teacher?.email}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Phone :
                </label>
                <p className="mt-1 text-gray-500">{teacher?.phone}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Join Date :
                </label>
                <p className="mt-1 text-gray-500">
                  {extractDate(teacher?.joinDate)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">
              Professional Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-800">
                  TSC Number :
                </label>
                <p className="mt-1 text-gray-500">{teacher?.tsc_number}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Department :
                </label>
                <p className="mt-1 text-gray-500">{teacher?.department}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Subjects :
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {teacher?.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Qualifications :
                </label>
                <div className="mt-1">
                  {teacher?.qualifications.map((qual, index) => (
                    <p key={index} className="text-sm text-gray-500">
                      {qual}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EditTeacherModal;
