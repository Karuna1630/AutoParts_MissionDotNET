import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './auth/Register';
import Login from './auth/Login';
import Landing from './pages/Landing';

// Customer Components
import CustomerLayout from './dashboard/customer/CustomerLayout';
import CustomerDashboard from './dashboard/customer/CustomerDashboard';
import MyVehicles from './dashboard/customer/MyVehicles';
import Appointments from './dashboard/customer/Appointments';
import Notifications from './dashboard/customer/Notifications';
import PartsShop from './dashboard/customer/PartsShop';
import PartRequests from './dashboard/customer/PartRequests';
import TransactionHistory from './dashboard/customer/TransactionHistory';
import HealthPredictor from './dashboard/customer/HealthPredictor';
import PointsWallet from './dashboard/customer/PointsWallet';
import Rewards from './dashboard/customer/Rewards';
import ProfileSettings from './dashboard/customer/ProfileSettings';

// Admin Components
import AdminLayout from './dashboard/admin/AdminLayout';
import AdminDashboard from './dashboard/admin/AdminDashboard';
import UserManagement from './dashboard/admin/UserManagement';
import StaffManagement from './dashboard/admin/StaffManagement';
import VendorManagement from './dashboard/admin/VendorManagement';
import Inventory from './dashboard/admin/Inventory';
import PurchaseInvoices from './dashboard/admin/PurchaseInvoices';
import FinancialAnalytics from './dashboard/admin/FinancialAnalytics';

// Staff Components
import StaffLayout from './dashboard/staff/StaffLayout';
import StaffDashboard from './dashboard/staff/StaffDashboard';
import Customers from './dashboard/staff/Customers';
import CustomerDetails from './dashboard/staff/CustomerDetails';
import PointOfSale from './dashboard/staff/PointOfSale';
import GlobalSearch from './dashboard/staff/GlobalSearch';
import Reports from './dashboard/staff/Reports';
import StaffProfile from './dashboard/staff/StaffProfile';
import StaffAppointments from './dashboard/staff/StaffAppointments';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Customer Dashboard Routes */}
        <Route path="/dashboard" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="vehicles" element={<MyVehicles />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="shop" element={<PartsShop />} />
          <Route path="requests" element={<PartRequests />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="predictor" element={<HealthPredictor />} />
          <Route path="wallet" element={<PointsWallet />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="invoices" element={<PurchaseInvoices />} />
          <Route path="analytics" element={<FinancialAnalytics />} />
        </Route>

        {/* Staff Dashboard Routes */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="pos" element={<PointOfSale />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="reports" element={<Reports />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
