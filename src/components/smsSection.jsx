import React, { useState } from 'react';
import { Users, Send, AlertCircle } from 'lucide-react';

const SMSSection = () => {
  // Form states
  const [recipientType, setRecipientType] = useState('all');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Sample data
  const recipientGroups = {
    students: ['Class 10A', 'Class 10B', 'Class 11A', 'Class 11B'],
    teachers: ['Mathematics Dept', 'Science Dept', 'English Dept', 'History Dept'],
    parents: ['Class 10 Parents', 'Class 11 Parents', 'Class 12 Parents']
  };

  const smsTemplates = [
    { id: 1, name: 'Attendance Alert', message: 'Your ward was absent today.' },
    { id: 2, name: 'Event Reminder', message: 'Reminder: School event tomorrow.' },
    { id: 3, name: 'Emergency Notice', message: 'Important: School closed tomorrow.' }
  ];

  // Calculate remaining characters
  const maxCharacters = 160;
  const remainingCharacters = maxCharacters - message.length;

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    const template = smsTemplates.find(t => t.id === parseInt(templateId));
    if (template) {
      setSelectedTemplate(templateId);
      setMessage(template.message);
    }
  };

  const handleSendSMS = () => {
    // Implementation for sending SMS
    console.log('Sending SMS...', {
      recipientType,
      selectedGroups,
      message
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Recipients Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Recipients</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <select
              className="flex-1 rounded-md border border-gray-300 py-2 px-3"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
            >
              <option value="all">All Recipients</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
            
            <select
              className="flex-1 rounded-md border border-gray-300 py-2 px-3"
              multiple
              value={selectedGroups}
              onChange={(e) => setSelectedGroups(Array.from(e.target.selectedOptions, option => option.value))}
            >
              {recipientType !== 'all' && 
                recipientGroups[recipientType]?.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))
              }
            </select>
          </div>

          {selectedGroups.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedGroups.map(group => (
                <span key={group} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {group}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SMS Content Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">SMS Content</h2>
        <div className="space-y-4">
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3"
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">Select Template (Optional)</option>
            {smsTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <textarea
              placeholder="Type your message here..."
              className="w-full rounded-md border border-gray-300 py-2 px-3 h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={maxCharacters}
            />
            <div className={`mt-2 text-sm flex items-center ${
              remainingCharacters < 20 ? 'text-red-600' : 'text-gray-500'
            }`}>
              <AlertCircle className="w-4 h-4 mr-1" />
              {remainingCharacters} characters remaining
            </div>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSendSMS}
          disabled={!message || message.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          Send SMS
        </button>
      </div>
    </div>
  );
};

export default SMSSection;