import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, UserPlus } from "lucide-react";

const HostelFormModal = ({ show, onClose, onSave, room = null }) => {
  const [formData, setFormData] = useState({
    roomNumber: "",
    block: "A",
    floor: "1",
    capacity: 4,
    type: "Standard",
    facilities: [],
    occupants: [],
  });

  const [studentData, setStudentData] = useState({
    name: "",
    admissionNo: "",
    class: "",
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);

  const handleAddOccupant = () => {
    if (studentData.name && studentData.admissionNo) {
      setFormData({
        ...formData,
        occupants: [...formData.occupants, { ...studentData, id: Date.now() }],
      });
      setStudentData({ name: "", admissionNo: "", class: "" });
    }
  };

  const handleRemoveOccupant = (studentId) => {
    setFormData({
      ...formData,
      occupants: formData.occupants.filter(
        (student) => student.id !== studentId
      ),
    });
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        show ? "" : "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {room ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-4"
        >
          {/* Room Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.block}
                onChange={(e) =>
                  setFormData({ ...formData, block: e.target.value })
                }
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value),
                  })
                }
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            <div className="flex flex-wrap gap-2">
              {["Fan", "Cupboard", "Study Table", "AC", "Bathroom"].map(
                (facility) => (
                  <label key={facility} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600"
                      checked={formData.facilities.includes(facility)}
                      onChange={(e) => {
                        const updatedFacilities = e.target.checked
                          ? [...formData.facilities, facility]
                          : formData.facilities.filter((f) => f !== facility);
                        setFormData({
                          ...formData,
                          facilities: updatedFacilities,
                        });
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {facility}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Occupants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Occupants ({formData.occupants.length}/{formData.capacity})
            </label>
            <div className="space-y-2">
              {formData.occupants.map((student) => (
                <div key={student.id} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">{student.name}</span>
                    <span className="text-sm text-gray-600">
                      {student.admissionNo}
                    </span>
                    <span className="text-sm text-gray-600">
                      {student.class}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOccupant(student.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.occupants.length < formData.capacity && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Student Name"
                    className="flex-1 rounded-md border border-gray-300 py-1 px-2"
                    value={studentData.name}
                    onChange={(e) =>
                      setStudentData({ ...studentData, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Admission No"
                    className="w-32 rounded-md border border-gray-300 py-1 px-2"
                    value={studentData.admissionNo}
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        admissionNo: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Class"
                    className="w-24 rounded-md border border-gray-300 py-1 px-2"
                    value={studentData.class}
                    onChange={(e) =>
                      setStudentData({ ...studentData, class: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddOccupant}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {room ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostelFormModal;
