// components/emailSection.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter, ChevronDown, Mail, Users, Search } from 'lucide-react';
import { getEmails, sendEmail, getClasses, getDepartments } from '../util/communicationServices';
import { format } from 'date-fns';

const EmailSection = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipientType: 'individual',
    recipientEmails: [''],
    recipientGroupId: '',
  });
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await getEmails();
      setEmails(data);
      setError(null);
    } catch (error) {
      setError('Failed to load emails');
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
        getDepartments()
      ]);
      setClasses(classesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching recipient options:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchRecipientOptions();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle email recipient input changes (for individual recipients)
  const handleEmailChange = (index, value) => {
    const updatedEmails = [...formData.recipientEmails];
    updatedEmails[index] = value;
    setFormData((prev) => ({
      ...prev,
      recipientEmails: updatedEmails,
    }));
  };

  // Add another email input field
  const addEmailField = () => {
    setFormData((prev) => ({
      ...prev,
      recipientEmails: [...prev.recipientEmails, ''],
    }));
  };

  // Remove email input field
  const removeEmailField = (index) => {
    if (formData.recipientEmails.length <= 1) return; // Keep at least one field
    
    const updatedEmails = formData.recipientEmails.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      recipientEmails: updatedEmails,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty email addresses
    const emailData = {
      ...formData,
      recipientEmails: formData.recipientEmails.filter(email => email.trim() !== '')
    };
    
    try {
      await sendEmail(emailData);
      // Clear form and hide it
      setFormData({
        subject: '',
        message: '',
        recipientType: 'individual',
        recipientEmails: [''],
        recipientGroupId: '',
      });
      setShowNewForm(false);
      // Refresh emails list
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
    }
  };

  // Filter emails
  const filteredEmails = searchTerm 
    ? emails.filter(email => 
        email.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : emails;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Email Communications</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button 
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Compose Email
          </button>
        </div>
      </div>

      {/* New Email Form */}
      {showNewForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Compose Email</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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

              {formData.recipientType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Addresses
                  </label>
                  {formData.recipientEmails.map((email, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter email address"
                        required={index === 0}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="mt-1 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Another Email
                  </button>
                </div>
              )}

              {formData.recipientType === 'class' && (
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
                    {classes.map(classItem => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === 'department' && (
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
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your email message..."
                  required
                />
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
                  Send Email
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
        /* Emails list */
        <div className="space-y-4">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No emails found
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="text-md font-medium text-gray-900">
                        {email.sender_name} 
                        {email.recipient_email && (
                          <span className="text-gray-600 font-normal"> to {email.recipient_email}</span>
                        )}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(email.created_at), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    email.status === 'sent' || email.status === 'delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : email.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {email.status}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{email.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EmailSection;