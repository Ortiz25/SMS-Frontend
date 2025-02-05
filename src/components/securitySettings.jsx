import React, { useState } from 'react';
import { Shield, Key, Lock, Smartphone, Clock, AlertCircle } from 'lucide-react';

const SecuritySettings = () => {
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    passwordExpiration: 90,
    enforceHistory: 5
  });

  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enforceForAdmins: true,
    enforceForTeachers: false,
    allowedMethods: ['app', 'sms', 'email'],
    gracePeriod: 7
  });

  const [sessionSettings, setSessionSettings] = useState({
    sessionTimeout: 30,
    maxConcurrentSessions: 2,
    rememberMeDuration: 14
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Security Settings</h1>
        <p className="text-sm text-gray-500">Configure system security and access policies</p>
      </div>

      {/* Password Policy Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Password Policy</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Password Length
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                minLength: parseInt(e.target.value)
              })}
              min="8"
              max="32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password History
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={passwordPolicy.enforceHistory}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                enforceHistory: parseInt(e.target.value)
              })}
              min="0"
              max="10"
            />
            <p className="mt-1 text-sm text-gray-500">
              Number of previous passwords that cannot be reused
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Expiration (Days)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={passwordPolicy.passwordExpiration}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                passwordExpiration: parseInt(e.target.value)
              })}
              min="0"
              max="365"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={passwordPolicy.requireUppercase}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                requireUppercase: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Require uppercase letters</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={passwordPolicy.requireNumbers}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                requireNumbers: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Require numbers</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={passwordPolicy.requireSpecialChars}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                requireSpecialChars: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Require special characters</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={passwordPolicy.preventCommonPasswords}
              onChange={(e) => setPasswordPolicy({
                ...passwordPolicy,
                preventCommonPasswords: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Prevent common passwords</span>
          </label>
        </div>
      </div>

      {/* Two-Factor Authentication Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enforce 2FA for User Roles
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 mr-2"
                  checked={twoFactorSettings.enforceForAdmins}
                  onChange={(e) => setTwoFactorSettings({
                    ...twoFactorSettings,
                    enforceForAdmins: e.target.checked
                  })}
                />
                <span className="text-sm text-gray-700">Administrators</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 mr-2"
                  checked={twoFactorSettings.enforceForTeachers}
                  onChange={(e) => setTwoFactorSettings({
                    ...twoFactorSettings,
                    enforceForTeachers: e.target.checked
                  })}
                />
                <span className="text-sm text-gray-700">Teachers</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Authentication Methods
            </label>
            <div className="space-y-2">
              {['app', 'sms', 'email'].map(method => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 mr-2"
                    checked={twoFactorSettings.allowedMethods.includes(method)}
                    onChange={(e) => {
                      const newMethods = e.target.checked
                        ? [...twoFactorSettings.allowedMethods, method]
                        : twoFactorSettings.allowedMethods.filter(m => m !== method);
                      setTwoFactorSettings({
                        ...twoFactorSettings,
                        allowedMethods: newMethods
                      });
                    }}
                  />
                  <span className="text-sm text-gray-700 capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Session Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={sessionSettings.sessionTimeout}
              onChange={(e) => setSessionSettings({
                ...sessionSettings,
                sessionTimeout: parseInt(e.target.value)
              })}
              min="5"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Concurrent Sessions
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={sessionSettings.maxConcurrentSessions}
              onChange={(e) => setSessionSettings({
                ...sessionSettings,
                maxConcurrentSessions: parseInt(e.target.value)
              })}
              min="1"
              max="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              "Remember Me" Duration (Days)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={sessionSettings.rememberMeDuration}
              onChange={(e) => setSessionSettings({
                ...sessionSettings,
                rememberMeDuration: parseInt(e.target.value)
              })}
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Security Settings
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;