import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiUserPlus, FiUser, FiPhone, 
  FiMail, FiChevronRight, FiCreditCard,
  FiFilter, FiRefreshCw
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { getAllCustomers, searchCustomers } from '../../services/staffService';
import { getApiErrorMessage } from '../../services/api';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      try {
        const response = await searchCustomers(query);
        if (response.success) {
          setCustomers(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    } else if (query.length === 0) {
      fetchCustomers();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-2 font-medium">View and manage registered customers and their vehicles.</p>
        </div>
        <button 
          onClick={() => navigate('/staff/customers/register')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          <FiUserPlus size={20} /> Register New Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, email, phone or vehicle number..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition">
            <FiFilter /> Filters
          </button>
          <button 
            onClick={fetchCustomers}
            className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Customer List */}
      {error && (
        <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-100 font-bold text-center">
          {error}
        </div>
      )}

      {loading && customers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100">
          <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-4">
            <FiUser size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No customers found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or register a new customer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} onClick={() => navigate(`/staff/customers/${customer.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomerCard = ({ customer, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          {customer.avatarUrl ? (
            <img src={customer.avatarUrl} alt={customer.fullName} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              {customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{customer.fullName}</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">Customer ID: #{customer.id}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <FiMail className="text-slate-400" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <FiPhone className="text-slate-400" />
            <span>{customer.phone}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FiCreditCard size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Balance</p>
              <p className="text-sm font-black text-slate-800">${customer.creditBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <FaCar size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Vehicles</p>
              <p className="text-sm font-black text-slate-800">{customer.vehicles?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 py-3 px-8 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
        <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-widest">View Full Profile</span>
        <FiChevronRight className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default Customers;
