import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Settings, AlertCircle } from 'lucide-react';

const NotificationSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      username: 'notifications@school.com',
      password: '********',
      encryption: 'TLS'
    },
    senderName: 'School Management System',
    senderEmail: 'notifications@school.com',
    replyTo: 'support@school.com',
    maxRetries: 3
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    apiKey: '********',
    apiSecret: '********',
    senderId: 'SCHOOL',
    defaultCountryCode: '+1'
  });

  const [notificationTypes, setNotificationTypes] = useState([
    {
      id: 'user_login',
      name: 'User Login Alerts',
      description: 'Notify administrators about suspicious login attempts',
      email: true,
      sms: true,
      recipients: ['admin']
    },
    {
      id: 'student_attendance',
      name: 'Student Attendance',
      description: 'Send alerts to parents about student attendance',
      email: true,
      sms: true,
      recipients: ['parents']
    },
    {
      id: 'exam_results',
      name: 'Exam Results',
      description: 'Notify when exam results are published',
      email: true,
      sms: false,
      recipients: ['students', 'parents']
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
        <p className="text-sm text-gray-500">Configure email and SMS notification settings</p>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Email Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.smtp.host}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                smtp: { ...emailSettings.smtp, host: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Port
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.smtp.port}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                smtp: { ...emailSettings.smtp, port: parseInt(e.target.value) }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.smtp.username}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                smtp: { ...emailSettings.smtp, username: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.smtp.password}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                smtp: { ...emailSettings.smtp, password: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.senderName}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                senderName: e.target.value
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reply-To Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={emailSettings.replyTo}
              onChange={(e) => setEmailSettings({
                ...emailSettings,
                replyTo: e.target.value
              })}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Email Configuration
          </button>
        </div>
      </div>

      {/* SMS Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-medium text-gray-900">SMS Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS Provider
            </label>
            <select
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={smsSettings.provider}
              onChange={(e) => setSmsSettings({
                ...smsSettings,
                provider: e.target.value
              })}
            >
              <option value="twilio">Twilio</option>
              <option value="messagebird">MessageBird</option>
              <option value="nexmo">Nexmo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={smsSettings.apiKey}
              onChange={(e) => setSmsSettings({
                ...smsSettings,
                apiKey: e.target.value
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender ID
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={smsSettings.senderId}
              onChange={(e) => setSmsSettings({
                ...smsSettings,
                senderId: e.target.value
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Country Code
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={smsSettings.defaultCountryCode}
              onChange={(e) => setSmsSettings({
                ...smsSettings,
                defaultCountryCode: e.target.value
              })}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test SMS Configuration
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-medium text-gray-900">Notification Types</h2>
        </div>

        <div className="space-y-4">
          {notificationTypes.map(notification => (
            <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{notification.name}</h3>
                  <p className="text-sm text-gray-500">{notification.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 mr-2"
                      checked={notification.email}
                      onChange={(e) => {
                        const updated = notificationTypes.map(n =>
                          n.id === notification.id
                            ? { ...n, email: e.target.checked }
                            : n
                        );
                        setNotificationTypes(updated);
                      }}
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 mr-2"
                      checked={notification.sms}
                      onChange={(e) => {
                        const updated = notificationTypes.map(n =>
                          n.id === notification.id
                            ? { ...n, sms: e.target.checked }
                            : n
                        );
                        setNotificationTypes(updated);
                      }}
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;