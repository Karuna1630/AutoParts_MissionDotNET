import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { apiClient } from '../../services/api';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        notes,
        items: cart.map(item => ({
          partId: item.id,
          quantity: item.quantity
        }))
      };

      // Corrected path: removed extra '/api' prefix
      const res = await apiClient.post('/OrderRequests', orderData);
      
      if (res.data.success) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition duration-500 ease-in-out animate-in slide-in-from-right">
          <div className="flex h-full flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{itemCount} items selected</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {success ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <FiCheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Order Submitted!</h3>
                  <p className="text-slate-500 font-medium">Your request is now pending staff review. You'll be notified once it's invoiced and ready for pickup.</p>
                  <button onClick={onClose} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Close Drawer</button>
                </div>
              ) : cart.length > 0 ? (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2">
                        <img src={item.imageUrl || '/placeholder-part.png'} alt={item.partName} className="h-full w-full object-contain" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{item.partName}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sku}</p>
                          </div>
                          <p className="font-black text-slate-900">Rs. {item.price.toLocaleString()}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-blue-600 transition-colors">
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-blue-600 transition-colors">
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Order Notes (Optional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions for staff..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                    <FiShoppingBag size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-slate-500 text-sm">Add some parts from the shop to start an order request.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && cart.length > 0 && (() => {
              const hasDiscount = subtotal > 5000;
              const discountAmount = hasDiscount ? subtotal * 0.10 : 0;
              const estimatedTotal = subtotal - discountAmount;
              
              return (
                <div className="border-t border-slate-100 px-6 py-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Subtotal</span>
                    <span className="font-bold text-slate-700">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {hasDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                        🎉 Loyalty Discount (10%)
                      </span>
                      <span className="font-bold text-emerald-600">- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-slate-800 font-bold">Estimated Total</span>
                    <span className="text-2xl font-black text-slate-900">Rs. {estimatedTotal.toLocaleString()}</span>
                  </div>

                  {hasDiscount ? (
                    <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-700 font-semibold border border-emerald-100 flex gap-2">
                      <FiCheckCircle className="flex-shrink-0 mt-0.5" size={14} />
                      <p>You qualify for the <strong>10% Loyalty Discount</strong> since your order exceeds Rs. 5,000!</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-600 font-semibold border border-blue-100 flex gap-2">
                      <FiInfo className="flex-shrink-0 mt-0.5" size={14} />
                      <p>Spend over Rs. 5,000 to unlock a <strong>10% Loyalty Discount</strong> on your order!</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Order...' : 'Submit Order Request'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
