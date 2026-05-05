import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiInfo, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { searchParts } from '../../services/partService';

const PartsShop = () => {
  const [parts, setParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const response = await searchParts(searchQuery);
        if (response.success) {
          setParts(response.data);
        } else {
          setApiError(response.message || 'Failed to load parts.');
        }
      } catch (err) {
        console.error(err);
        setApiError(err.response?.data?.message || err.message || 'An error occurred while fetching parts.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchParts();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className='p-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className='text-4xl font-black text-slate-900 tracking-tight'>Parts Shop</h1>
          <p className='text-slate-500 font-medium mt-1'>Browse and find genuine parts for your vehicle.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search parts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-sm w-80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <Link 
            to="/dashboard/requests" 
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            Special Request <FiArrowRight />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse">
              <div className="w-full h-40 bg-slate-50 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-50 rounded w-1/2 mb-6" />
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-100 rounded w-1/4" />
                <div className="h-10 bg-slate-50 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : apiError ? (
        <div className="bg-red-50 border border-red-100 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6">
            <FiAlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-red-800">Connection Error</h3>
          <p className="text-red-600 mt-2 max-w-md">{apiError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
          >
            Try Again
          </button>
        </div>
      ) : parts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {parts.map(part => (
            <div 
              key={part.id} 
              className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full"
            >
              <div className="w-full h-40 bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                {part.imageUrl ? (
                  <img src={part.imageUrl} alt={part.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <FiShoppingCart size={40} className="text-slate-200" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{part.sku}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">In Stock</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">{part.name}</h3>
                <p className="text-xs text-slate-500 font-medium mb-4">{part.category}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</span>
                  <span className="text-xl font-black text-slate-900">Rs.{part.price.toLocaleString()}</span>
                </div>
                <button 
                  className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-90"
                  onClick={() => alert('Purchase feature coming soon! For now, please visit our staff to complete the purchase.')}
                >
                  <FiShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiSearch size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No parts found</h3>
          <p className="text-slate-500 mt-2 max-w-md">We couldn't find any parts matching your search. Try adjusting your filters or request a special part.</p>
          <Link 
            to="/dashboard/requests" 
            className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            Request Special Part
          </Link>
        </div>
      )}
    </div>
  );
};

export default PartsShop;
