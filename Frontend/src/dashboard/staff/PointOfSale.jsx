import React, { useState, useEffect } from 'react';
import { 
  FiShoppingCart, FiSearch, FiCreditCard, FiUser, FiPlus, 
  FiTrash2, FiMinus, FiCheckCircle, FiAlertCircle, FiLoader 
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { searchParts, createSalesInvoice } from '../../services/salesService';
import { getAllCustomers, searchCustomers } from '../../services/staffService';
import { getApiErrorMessage } from '../../services/api';

const PointOfSale = () => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [amountPaid, setAmountPaid] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subtotal > 5000 ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  // Search Parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const response = await searchParts(searchQuery);
        if (response.success) setParts(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchParts();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search Customers
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerSearch.length > 1) {
        try {
          const response = await searchCustomers(customerSearch);
          if (response.success) setCustomers(response.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setCustomers([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  const addToCart = (part) => {
    const existing = cart.find(item => item.id === part.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...part, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer first.");
      return;
    }
    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const invoiceData = {
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle?.id,
      paymentMethod,
      paymentStatus,
      amountPaid: parseFloat(amountPaid || 0),
      items: cart.map(item => ({
        partId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await createSalesInvoice(invoiceData);
      if (response.success) {
        setOrderSuccess(response.data);
        setCart([]);
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setAmountPaid('');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Payment Successful!</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Invoice #{orderSuccess.invoiceNumber} has been created and inventory levels updated.</p>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => setOrderSuccess(null)}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
          >
            New Transaction
          </button>
          <button className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">
            Print Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Product & Customer Selection */}
      <div className="flex-[2] flex flex-col gap-6 h-full overflow-hidden">
        {/* Part Selection Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search parts by name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <FiLoader className="animate-spin text-blue-600" size={32} />
              </div>
            ) : parts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parts.map(part => (
                  <button 
                    key={part.id} 
                    onClick={() => addToCart(part)}
                    disabled={part.stockQuantity <= 0}
                    className={`p-4 text-left border rounded-2xl transition group flex flex-col gap-2 ${
                      part.stockQuantity > 0 
                        ? 'border-slate-100 hover:border-blue-500 hover:bg-blue-50/30' 
                        : 'opacity-50 grayscale cursor-not-allowed border-slate-100'
                    }`}
                  >
                    <div className="w-full h-32 bg-slate-50 rounded-xl mb-3 overflow-hidden border border-slate-100 flex items-center justify-center p-2">
                      {part.imageUrl ? (
                        <img src={part.imageUrl} alt={part.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <FiShoppingCart size={32} className="text-slate-200" />
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{part.sku}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${part.stockQuantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        Qty: {part.stockQuantity}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{part.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-black text-slate-900">Rs.{part.price.toFixed(2)}</span>
                      <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FiPlus size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <FiShoppingCart size={48} className="mb-4 opacity-50" />
                <p className="font-bold uppercase tracking-widest text-xs">Search for parts to add</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-96 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-full">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Order Summary</h3>
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">{cart.length} Items</span>
        </div>

        {/* Customer Search inside Order Summary */}
        <div className="p-4 border-b border-slate-100">
          {!selectedCustomer ? (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search customer..." 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {customers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden max-h-48 overflow-y-auto">
                  {customers.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => {setSelectedCustomer(c); setCustomers([]); setCustomerSearch('')}}
                      className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 transition text-xs"
                    >
                      <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {c.fullName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{c.fullName}</p>
                        <p className="text-[9px] text-slate-400">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.fullName[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{selectedCustomer.fullName}</p>
                  <p className="text-[10px] text-slate-400">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => {setSelectedCustomer(null); setCustomers([])}} className="text-[10px] text-red-500 font-bold hover:underline">Change</button>
            </div>
          )}
          {selectedCustomer && selectedCustomer.vehicles?.length > 0 && (
            <select 
              onChange={(e) => setSelectedVehicle(selectedCustomer.vehicles.find(v => v.id === parseInt(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-600 outline-none mt-2"
            >
              <option value="">Select Vehicle (Optional)</option>
              {selectedCustomer.vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model} - {v.licensePlate}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 group">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-2.5 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiShoppingCart size={14} className="text-slate-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Rs.{item.price.toFixed(2)} / unit</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-1.5 py-0.5">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-blue-600 transition-colors"><FiMinus size={12} /></button>
                    <span className="text-[10px] font-black text-slate-800 min-w-[16px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-blue-600 transition-colors"><FiPlus size={12} /></button>
                  </div>
                  <span className="text-xs font-black text-slate-900">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-8">
              <p className="text-xs font-medium">Cart is empty</p>
            </div>
          )}
        </div>

        {/* Checkout Controls */}
        <div className="p-6 border-t border-slate-50 space-y-4 bg-slate-50/30">
          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Credit', 'Card'].map(m => (
              <button 
                key={m}
                onClick={() => {
                  setPaymentMethod(m === 'Card' ? 'CreditCard' : m);
                  if (m === 'Credit') setPaymentStatus('Credit');
                  else setPaymentStatus('Paid');
                }}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  (paymentMethod === m || (m === 'Card' && paymentMethod === 'CreditCard'))
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-wider">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <span>Loyalty Discount (10%)</span>
                <span>-Rs.{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between text-slate-900 font-black text-xl uppercase tracking-tight">
              <span>Total</span>
              <span className="text-blue-600">Rs.{total.toFixed(2)}</span>
            </div>
          </div>

          {paymentStatus === 'Partial' || paymentStatus === 'Paid' ? (
            <div className="relative mt-4">
              <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ) : null}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold animate-in shake duration-300">
              <FiAlertCircle /> {error}
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${
              isProcessing || cart.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30 active:scale-95'
            }`}
          >
            {isProcessing ? <FiLoader className="animate-spin" /> : <FiCreditCard />}
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
