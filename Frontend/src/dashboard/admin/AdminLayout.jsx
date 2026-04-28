import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
