import React, { useState, useEffect } from 'react';
import { FiPackage, FiUser, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiFileText, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '../../services/api';

const StaffOrderRequests = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/OrderRequests/pending');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      setError('Failed to load pending orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (orderId) => {
    if (!window.confirm('Are you sure you want to create an invoice and reserve stock for this order?')) return;
    
    try {
      setProcessingId(orderId);
      const res = await apiClient.post(`/OrderRequests/${orderId}/create-invoice`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchPendingOrders();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order request?')) return;
    
    try {
      setProcessingId(orderId);
      const res = await apiClient.patch(`/OrderRequests/${orderId}/cancel`);
      if (res.data.success) {
        fetchPendingOrders();
      }
    } catch (err) {
      alert('Failed to cancel order.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pending Bulk Orders</h1>
        <p className="text-slate-500 font-medium mt-1">Review customer cart submissions and convert them to invoices.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-3">
          <FiCheckCircle size={20} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 animate-pulse h-48" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/30 transition-all">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FiUser size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{order.customerName}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FiClock /> {new Date(order.requestDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                      <p className="text-2xl font-black text-slate-900">Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handleCreateInvoice(order.id)}
                      disabled={processingId === order.id}
                      className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <FiFileText />
                      {processingId === order.id ? 'Processing...' : 'Create Invoice'}
                    </button>
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={processingId === order.id}
                      className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <FiXCircle size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[24px] border border-slate-100 p-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Order Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <FiPackage size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.partName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity} × Rs.{item.unitPriceAtRequest.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 flex gap-3 text-sm text-slate-500 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                    <FiInfo className="flex-shrink-0 mt-0.5" />
                    <p><strong>Customer Note:</strong> {order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiTruck size={40}/>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No pending orders</h3>
          <p className="text-slate-500 mt-2 max-w-md">All customer bulk order requests have been processed.</p>
        </div>
      )}
    </div>
  );
};

export default StaffOrderRequests;
