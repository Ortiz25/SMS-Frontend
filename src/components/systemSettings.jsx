import React, { useState } from 'react';
import { Settings, Database, Clock, Globe, Upload, Download } from 'lucide-react';

const SystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    schoolName: 'International School',
    address: '123 Education Street',
    phone: '+1 234 567 8900',
    email: 'contact@school.com',
    website: 'www.school.com',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en'
  });

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    enableMaintenance: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    maintenanceWindow: {
      start: '22:00',
      end: '04:00'
    },
    allowedIPs: ['192.168.1.1']
  });

  const [backupSettings, setBackupSettings] = useState({
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    includeAttachments: true,
    backupLocation: 'cloud',
    lastBackup: '2025-02-04 02:00:00'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500">Configure system-wide settings and preferences</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.schoolName}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                schoolName: e.target.value
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.email}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                email: e.target.value
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                timezone: e.target.value
              })}
            >
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-8">Pacific Time (UTC-8)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                dateFormat: e.target.value
              })}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                language: e.target.value
              })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={generalSettings.currency}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                currency: e.target.value
              })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-medium text-gray-900">Maintenance Mode</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={maintenanceSettings.enableMaintenance}
              onChange={(e) => setMaintenanceSettings({
                ...maintenanceSettings,
                enableMaintenance: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Enable Maintenance Mode</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Message
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              rows={3}
              value={maintenanceSettings.maintenanceMessage}
              onChange={(e) => setMaintenanceSettings({
                ...maintenanceSettings,
                maintenanceMessage: e.target.value
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={maintenanceSettings.maintenanceWindow.start}
                onChange={(e) => setMaintenanceSettings({
                  ...maintenanceSettings,
                  maintenanceWindow: {
                    ...maintenanceSettings.maintenanceWindow,
                    start: e.target.value
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={maintenanceSettings.maintenanceWindow.end}
                onChange={(e) => setMaintenanceSettings({
                  ...maintenanceSettings,
                  maintenanceWindow: {
                    ...maintenanceSettings.maintenanceWindow,
                    end: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-medium text-gray-900">Backup & Restore</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 mr-2"
              checked={backupSettings.enableAutoBackup}
              onChange={(e) => setBackupSettings({
                ...backupSettings,
                enableAutoBackup: e.target.checked
              })}
            />
            <span className="text-sm text-gray-700">Enable Automatic Backups</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={backupSettings.backupFrequency}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  backupFrequency: e.target.value
                })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Time
              </label>
              <input
                type="time"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={backupSettings.backupTime}
                onChange={(e) => setBackupSettings({
                  ...backupSettings,
                  backupTime: e.target.value
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retention Period (Days)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              value={backupSettings.retentionDays}
              onChange={(e) => setBackupSettings({
                ...backupSettings,
                retentionDays: parseInt(e.target.value)
              })}
              min={1}
              max={365}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Restore Backup
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save System Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;