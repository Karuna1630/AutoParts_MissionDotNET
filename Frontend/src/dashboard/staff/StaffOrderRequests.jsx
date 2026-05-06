import React, { useState, useEffect } from 'react';
import { FiPackage, FiUser, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiFileText, FiInfo, FiShoppingBag } from 'react-icons/fi';
import { apiClient } from '../../services/api';

const StaffOrderRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let endpoint = '/OrderRequests/pending';
      if (activeTab === 'reserved') endpoint = '/OrderRequests/all?status=Reserved';
      if (activeTab === 'completed') endpoint = '/OrderRequests/all?status=Completed';
      const res = await apiClient.get(endpoint);
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (orderId) => {
    if (!window.confirm('Create invoice and reserve stock for this order?')) return;
    try {
      setProcessingId(orderId);
      const res = await apiClient.post(`/OrderRequests/${orderId}/create-invoice`);
      if (res.data.success) {
        setSuccessMsg('Invoice created! Order is now reserved for pickup.');
        fetchOrders();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Mark this order as Completed (Picked Up)?')) return;
    try {
      setProcessingId(orderId);
      const res = await apiClient.patch(`/OrderRequests/${orderId}/complete`);
      if (res.data.success) {
        setSuccessMsg('Order completed!');
        fetchOrders();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      alert('Failed to complete order.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order request?')) return;
    try {
      setProcessingId(orderId);
      const res = await apiClient.patch(`/OrderRequests/${orderId}/cancel`);
      if (res.data.success) fetchOrders();
    } catch (err) {
      alert('Failed to cancel order.');
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Requests', icon: FiClock },
    { id: 'reserved', label: 'Ready for Pickup', icon: FiPackage },
    { id: 'completed', label: 'Completed', icon: FiCheckCircle }
  ];

  const statusColor = {
    Pending: 'bg-amber-100 text-amber-700',
    Reserved: 'bg-blue-100 text-blue-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and fulfill customer bulk part requests.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold text-sm flex items-center gap-2">
          <FiCheckCircle size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse h-28" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {orders.map(order => (
            <div key={order.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              {/* Top Row */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                    <FiUser size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{order.customerName}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FiClock size={10} /> {new Date(order.requestDate).toLocaleString()}
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${statusColor[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Total</p>
                    <p className="text-base font-bold text-slate-900">Rs. {order.totalAmount.toLocaleString()}</p>
                  </div>

                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => handleCreateInvoice(order.id)}
                        disabled={processingId === order.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <FiFileText size={13} />
                        {processingId === order.id ? 'Processing...' : 'Create Invoice'}
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={processingId === order.id}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiXCircle size={16} />
                      </button>
                    </>
                  )}

                  {activeTab === 'reserved' && (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      disabled={processingId === order.id}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <FiCheckCircle size={13} />
                      {processingId === order.id ? 'Processing...' : 'Mark as Completed'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items Row */}
              <div className="flex flex-wrap gap-2 ml-12">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs">
                    <FiPackage size={12} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{item.partName}</span>
                    <span className="text-slate-400">×{item.quantity}</span>
                    <span className="text-slate-400">Rs.{item.unitPriceAtRequest.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <FiShoppingBag className="text-slate-200 mb-3" size={36} />
          <h3 className="text-lg font-bold text-slate-800">No {activeTab} orders</h3>
          <p className="text-slate-500 text-sm mt-1">Check another tab or wait for new requests.</p>
        </div>
      )}
    </div>
  );
};

export default StaffOrderRequests;
