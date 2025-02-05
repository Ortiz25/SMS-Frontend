import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Megaphone } from 'lucide-react';
import AnnouncementSection from '../components/announcementSection';
import EmailSection from '../components/emailSection';
import SMSSection from '../components/smsSection';
import Navbar from '../components/navbar';
import { useStore } from "../store/store";
import { useEffect } from 'react';


const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('announcements');
    const { updateActiveModule, activeModule } = useStore();
  
    useEffect(() => {
      updateActiveModule("communications");
    }, [activeModule]);
  
  // Stats for the header
  const stats = {
    pendingMessages: 5,
    unreadNotifications: 3,
    activeAnnouncements: 2
  };

  return (
    <Navbar>
         <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white rounded-lg shadow-sm m-2 sm:m-4">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication Hub</h1>
    <div className="flex flex-wrap gap-2 sm:gap-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <Mail className="w-4 h-4 mr-2" />
        {stats.pendingMessages} Messages
      </span>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Bell className="w-4 h-4 mr-2" />
        {stats.unreadNotifications} Notifications
      </span>
    </div>
  </div>

  {/* Navigation Tabs */}
  <div className="border-b border-gray-200 overflow-x-auto">
    <nav className="flex sm:justify-start -mb-px space-x-4 sm:space-x-8 min-w-max">
      {['announcements', 'email', 'sms'].map((tab) => (
        <button
          key={tab}
          className={`py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-sm ${
            activeTab === tab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          <div className="flex items-center">
            {tab === 'announcements' && <Megaphone className="w-4 h-4 mr-2" />}
            {tab === 'email' && <Mail className="w-4 h-4 mr-2" />}
            {tab === 'sms' && <MessageSquare className="w-4 h-4 mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        </button>
      ))}
    </nav>
  </div>

  {/* Content Area */}
  <div className="mt-4 sm:mt-6">
    {activeTab === 'announcements' && <AnnouncementSection />}
    {activeTab === 'email' && <EmailSection />}
    {activeTab === 'sms' && <SMSSection />}
  </div>
</div>

    </Navbar>
   
  );
};

export default CommunicationHub;