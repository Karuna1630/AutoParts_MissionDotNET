import React, { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiTruck, FiInfo, FiPlus, FiAlertCircle, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { getAllParts, createPartRequest } from '../../services/partService';
import { getApiErrorMessage } from '../../services/api';
import { useCart } from '../../context/CartContext';

const PartsShop = () => {
  const { addToCart } = useCart();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('request'); // 'request' or 'order'
  const [selectedPart, setSelectedPart] = useState(null);
  const [requestForm, setRequestForm] = useState({
    partName: '',
    quantity: 1,
    urgency: 'Normal',
    description: '',
    vehicleInfo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await getAllParts();
      if (res.success) {
        setParts(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(parts.map(p => p.category))];

  const filteredParts = parts.filter(p => {
    const matchesSearch = (p.partName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAction = (part = null, type = 'request') => {
    if (type === 'order' && part) {
      addToCart(part, 1);
      return;
    }

    setSelectedPart(part);
    setModalType(type);
    setRequestForm({
      partName: part ? part.partName : '',
      quantity: 1,
      urgency: 'Normal',
      description: type === 'order' ? 'Direct Order for Pickup' : (part ? `Inquiry for ${part.partName} (SKU: ${part.sku})` : ''),
      vehicleInfo: ''
    });
    setShowModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createPartRequest(requestForm);
      if (res.success) {
        setSuccess(modalType === 'order' ? 'Your order has been placed successfully! Please visit the store for pickup.' : 'Your special request has been submitted successfully!');
        setShowModal(false);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100' };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search, Filters and New Request Action */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 relative w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by part name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block" />
            <button 
              onClick={() => handleOpenAction(null, 'request')}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FiPlus size={16} />
              Request Unavailable Part
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-3">
          <FiCheckCircle size={20} /> {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm flex items-center gap-3">
          <FiAlertCircle size={20} /> {error}
        </div>
      )}

      {/* Parts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse">
              <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredParts.map(part => {
            const stock = getStockStatus(part.stockQuantity);
            const isAvailable = part.stockQuantity > 0;
            return (
              <div key={part.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      {part.sku}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${stock.color}`}>
                      {stock.label}
                    </span>
                  </div>
                  
                  <div className="w-full h-40 bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                    {part.imageUrl ? (
                      <img src={part.imageUrl} alt={part.partName} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <FiShoppingCart size={40} className="text-slate-200" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                    {part.partName}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mb-4">{part.category}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Price</p>
                      <p className="text-xl font-black text-slate-900">Rs. {part.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenAction(part, isAvailable ? 'order' : 'request')}
                    className={`w-full mt-6 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      isAvailable 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700' 
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-100'
                    }`}
                  >
                    {isAvailable ? (
                      <><FiShoppingCart size={14} /> Order</>
                    ) : (
                      <><FiTruck size={14} /> Special Request</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiPackage size={40}/>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No parts found</h3>
          <p className="text-slate-500 mt-2 max-w-md">Try adjusting your search or category filters, or submit a special request for the part you need.</p>
          <button 
            onClick={() => handleOpenAction(null, 'request')}
            className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <FiPlus size={18} />
            Request Special Part
          </button>
        </div>
      )}

      {/* Action Modal (Order or Request) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">
                {modalType === 'order' ? 'Confirm Order' : 'Special Request'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <FiPackage size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                  {selectedPart?.imageUrl ? (
                    <img src={selectedPart.imageUrl} className="w-full h-full object-contain p-1" />
                  ) : (
                    <FiPackage className="text-slate-300" size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{requestForm.partName || 'Custom Part'}</h4>
                  {selectedPart && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPart.sku}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modalType === 'request' && !selectedPart && (
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Part Name *</label>
                    <input 
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="e.g. BMW M5 Brake Pads"
                      value={requestForm.partName}
                      onChange={(e) => setRequestForm({...requestForm, partName: e.target.value})}
                    />
                  </div>
                )}

                <div className={modalType === 'order' ? 'md:col-span-2' : ''}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Quantity *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm({...requestForm, quantity: parseInt(e.target.value)})}
                  />
                </div>

                {modalType === 'request' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Urgency *</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                    >
                      <option value="Normal">Not Urgent</option>
                      <option value="Soon">Need Soon</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Vehicle Info (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="e.g. 2022 Honda Civic"
                  value={requestForm.vehicleInfo}
                  onChange={(e) => setRequestForm({...requestForm, vehicleInfo: e.target.value})}
                />
              </div>

              {modalType === 'request' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Additional Notes</label>
                  <textarea 
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                    placeholder="Any extra details..."
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  />
                </div>
              )}

              {modalType === 'order' && (
                <div className="bg-blue-50 p-4 rounded-2xl text-xs text-blue-600 font-semibold border border-blue-100">
                  <FiInfo className="inline mb-0.5 mr-1" /> This will reserve the part for you. Please visit the store to complete the payment and pickup.
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Processing...' : (modalType === 'order' ? 'Confirm Order' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsShop;
