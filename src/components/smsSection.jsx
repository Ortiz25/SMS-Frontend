// components/smsSection.js
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Filter,
  ChevronDown,
  MessageSquare,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import {
  getSmsMessages,
  sendSms,
  getSmsTemplates,
  getClasses,
  getDepartments,
} from "../util/communicationServices";
import { format } from "date-fns";

const SMSSection = () => {
  const [smsMessages, setSmsMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    recipientType: "individual",
    recipientPhones: [""],
    recipientGroupId: "",
    templateId: "",
  });
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch SMS messages and templates
  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesData, templatesData] = await Promise.all([
        getSmsMessages(),
        getSmsTemplates(),
      ]);
      setSmsMessages(messagesData);
      setTemplates(templatesData);
      setError(null);
    } catch (error) {
      setError("Failed to load SMS messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipient options (classes, departments)
  const fetchRecipientOptions = async () => {
    try {
      const [classesData, departmentsData] = await Promise.all([
        getClasses(),
        getDepartments(),
      ]);
      setClasses(classesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error fetching recipient options:", error);
    }
  };

  useEffect(() => {
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    fetchData();
    fetchRecipientOptions();
  }, []);

  // Update message length
  useEffect(() => {
    setMessageLength(formData.message.length);
  }, [formData.message]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If a template is selected, update the message text
    if (name === "templateId" && value) {
      const selectedTemplate = templates.find((t) => t.id === parseInt(value));
      if (selectedTemplate) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          message: selectedTemplate.template_text,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle phone number input changes (for individual recipients)
  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...formData.recipientPhones];
    updatedPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      recipientPhones: updatedPhones,
    }));
  };

  // Add another phone input field
  const addPhoneField = () => {
    setFormData((prev) => ({
      ...prev,
      recipientPhones: [...prev.recipientPhones, ""],
    }));
  };

  // Remove phone input field
  const removePhoneField = (index) => {
    if (formData.recipientPhones.length <= 1) return; // Keep at least one field

    const updatedPhones = formData.recipientPhones.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      recipientPhones: updatedPhones,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty phone numbers
    const smsData = {
      ...formData,
      recipientPhones: formData.recipientPhones.filter(
        (phone) => phone.trim() !== ""
      ),
    };

    try {
      await sendSms(smsData);
      // Clear form and hide it
      setFormData({
        message: "",
        recipientType: "individual",
        recipientPhones: [""],
        recipientGroupId: "",
        templateId: "",
      });
      setShowNewForm(false);
      // Refresh SMS messages list
      fetchData();
    } catch (error) {
      console.error("Error sending SMS:", error);
      setError("Failed to send SMS");
    }
  };

  // Filter SMS messages
  const filteredSmsMessages = searchTerm
    ? smsMessages.filter(
        (sms) =>
          sms.recipient_phone
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sms.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sms.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : smsMessages;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          SMS Communications
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search SMS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New SMS
            </button>
          )}
        </div>
      </div>

      {/* New SMS Form */}
      {showNewForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Compose SMS</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Type
                  </label>
                  <select
                    name="recipientType"
                    value={formData.recipientType}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="individual">Individual Recipients</option>
                    <option value="all">All Users</option>
                    <option value="class">Specific Class</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="inline-flex items-center px-3 py-2 mt-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {showTemplates ? "Hide Templates" : "Choose Template"}
                  </button>
                </div>
              </div>

              {showTemplates && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMS Templates
                  </label>
                  <select
                    name="templateId"
                    value={formData.templateId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.purpose}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === "individual" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Numbers
                  </label>
                  {formData.recipientPhones.map((phone, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          handlePhoneChange(index, e.target.value)
                        }
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter phone number"
                        required={index === 0}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePhoneField(index)}
                          className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPhoneField}
                    className="mt-1 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Another Phone
                  </button>
                </div>
              )}

              {formData.recipientType === "class" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class
                  </label>
                  <select
                    name="recipientGroupId"
                    value={formData.recipientGroupId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a class...</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === "department" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Department
                  </label>
                  <select
                    name="recipientGroupId"
                    value={formData.recipientGroupId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message ({messageLength}/160 characters)
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    messageLength > 160 ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your SMS message..."
                  required
                />
                {messageLength > 160 && (
                  <p className="mt-1 text-xs text-red-600">
                    SMS exceeds 160 characters and may be split into multiple
                    messages (additional charges may apply).
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Send SMS
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* SMS messages list */
        <div className="space-y-4">
          {filteredSmsMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No SMS messages found
            </div>
          ) : (
            filteredSmsMessages.map((sms) => (
              <div
                key={sms.id}
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="text-md font-medium text-gray-900">
                        {sms.sender_name}
                        {sms.recipient_phone && (
                          <span className="text-gray-600 font-normal">
                            {" "}
                            to {sms.recipient_phone}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(sms.created_at), "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sms.cost && (
                      <span className="mr-2 text-xs text-gray-500">
                        Cost: KES {sms.cost.toFixed(2)}
                      </span>
                    )}
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        sms.status === "sent" || sms.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : sms.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sms.status}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {sms.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SMSSection;
