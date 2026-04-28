import React from 'react';
import { FiShoppingCart, FiSearch, FiCreditCard } from 'react-icons/fi';

const PointOfSale = () => {
  return (
    <div className="h-[calc(100vh-160px)] flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Product Selection */}
      <div className="flex-[2] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Point of Sale</h2>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search parts by name or SKU..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
            <FiShoppingCart size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Ready to sell?</h3>
          <p className="text-slate-500 mt-2 max-w-xs">Search for products or scan barcodes to begin a transaction.</p>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Current Order</h3>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center text-slate-400 text-sm font-medium">
          Cart is empty
        </div>
        <div className="p-6 border-t border-slate-50 space-y-4 bg-slate-50/50 rounded-b-3xl">
          <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Amount</span>
            <span>$0.00</span>
          </div>
          <button className="w-full bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold cursor-not-allowed transition-all flex items-center justify-center gap-3">
            <FiCreditCard />
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
