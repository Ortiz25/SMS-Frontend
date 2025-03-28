import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter, ChevronDown, Mail, Users, Search, X, Send, UserPlus, Loader2 } from 'lucide-react';
import { getEmails, sendEmail, getClasses, getDepartments } from '../util/communicationServices';
import { format } from 'date-fns';

const EmailSection = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
  const [filterStatus, setFilterStatus] = useState('all');

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
      console.log(classesData, departmentsData)
      setClasses(classesData.data);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching recipient options:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchRecipientOptions();
  }, []);
 console.log(emails)
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
    if (formData.recipientEmails.length <= 1) return; 
    
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
    
    // Validate form data
    if (formData.recipientType === 'individual' && emailData.recipientEmails.length === 0) {
      setError('Please add at least one valid email address');
      return;
    }
    
    if ((formData.recipientType === 'class' || formData.recipientType === 'department') 
        && !formData.recipientGroupId) {
      setError(`Please select a ${formData.recipientType === 'class' ? 'class' : 'department'}`);
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      const response = await sendEmail(emailData);
      
      // Show success message
      setSuccess(`Email${response.count > 1 ? 's' : ''} sent successfully to ${response.count} recipient${response.count > 1 ? 's' : ''}`);
      
      // Clear form and hide it after a delay
      setTimeout(() => {
        setFormData({
          subject: '',
          message: '',
          recipientType: 'individual',
          recipientEmails: [''],
          recipientGroupId: '',
        });
        setShowNewForm(false);
        setSuccess(null);
      }, 3000);
      
      // Refresh emails list
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // Filter emails by search term and status
  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchTerm 
      ? (email.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         email.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         email.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : email.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-blue-600" />
          Email Communications
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Compose Email
          </button>
        </div>
      </div>

      {/* New Email Form */}
      {showNewForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Compose Email</h3>
            <button 
              onClick={() => setShowNewForm(false)} 
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['individual', 'all', 'class', 'department'].map(type => (
                    <label key={type} className={`
                      flex items-center justify-center p-3 border rounded-md cursor-pointer
                      ${formData.recipientType === type 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}>
                      <input
                        type="radio"
                        name="recipientType"
                        value={type}
                        checked={formData.recipientType === type}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.recipientType === 'individual' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Recipients
                  </label>
                  <div className="space-y-2">
                    {formData.recipientEmails.map((email, index) => (
                      <div key={index} className="flex items-center">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                            className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter email address"
                            required={index === 0}
                          />
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeEmailField(index)}
                            className="ml-2 p-2 text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Recipient
                  </button>
                </div>
              )}

              {formData.recipientType === 'class' && (
                <div className="md:col-span-2">
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
                <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your email message..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button 
                type="button"
                onClick={() => setShowNewForm(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={sending}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading emails...</p>
        </div>
      ) : (
        /* Emails list */
        <div className="space-y-4">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow text-gray-500">
              <Mail className="h-12 w-12 text-gray-300 mb-4" />
              <p>No emails found</p>
              {searchTerm && <p className="text-sm">Try adjusting your search</p>}
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <h3 className="text-md font-medium text-gray-900">
                        {email.subject || 'No Subject'}
                      </h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="font-medium">{email.sender_name}</span>
                      {email.recipient_email && (
                        <>
                          <span className="mx-1">→</span>
                          <span>{email.recipient_email}</span>
                        </>
                      )}
                      {email.recipient_type === 'class' && <span className="text-blue-600 ml-1">(Class)</span>}
                      {email.recipient_type === 'department' && <span className="text-green-600 ml-1">(Department)</span>}
                      {email.recipient_type === 'all' && <span className="text-purple-600 ml-1">(All Users)</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(email.created_at), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`text-xs px-2.5 py-1 rounded-full flex items-center ${
                      email.status === 'sent' || email.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : email.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        email.status === 'sent' || email.status === 'delivered'
                          ? 'bg-green-600'
                          : email.status === 'pending'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}></span>
                      {email.status}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-gray-700 whitespace-pre-line text-sm mt-2">
                  {email.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EmailSection;