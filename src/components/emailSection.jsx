import React, { useState } from 'react';
import { Users, Send, Upload } from 'lucide-react';

const EmailSection = () => {
  // Form states
  const [recipientType, setRecipientType] = useState('all');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Sample data
  const recipientGroups = {
    students: ['Class 10A', 'Class 10B', 'Class 11A', 'Class 11B'],
    teachers: ['Mathematics Dept', 'Science Dept', 'English Dept', 'History Dept'],
    parents: ['Class 10 Parents', 'Class 11 Parents', 'Class 12 Parents']
  };

  const emailTemplates = [
    { id: 1, name: 'Event Invitation', subject: 'School Event Invitation' },
    { id: 2, name: 'Academic Update', subject: 'Academic Performance Update' },
    { id: 3, name: 'Fee Reminder', subject: 'Fee Payment Reminder' }
  ];

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    const template = emailTemplates.find(t => t.id === parseInt(templateId));
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      // You could also set message content here based on template
    }
  };

  const handleSendEmail = () => {
    // Implementation for sending email
    console.log('Sending email...', {
      recipientType,
      selectedGroups,
      subject,
      message,
      attachments
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

      {/* Email Content Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Email Content</h2>
        <div className="space-y-4">
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3"
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">Select Template (Optional)</option>
            {emailTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Email Subject"
            className="w-full rounded-md border border-gray-300 py-2 px-3"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            placeholder="Type your message here..."
            className="w-full rounded-md border border-gray-300 py-2 px-3 h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Attachments */}
          <div className="border-t border-gray-200 pt-4">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Add Attachment
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => setAttachments([...attachments, ...e.target.files])}
              />
            </label>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSendEmail}
          disabled={!subject || !message}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Email
        </button>
      </div>
    </div>
  );
};

export default EmailSection;