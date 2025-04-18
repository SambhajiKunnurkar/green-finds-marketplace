
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import EcoBadge from "../components/EcoBadge";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const navigate = useNavigate();

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleApplyPromoCode = () => {
    setIsApplyingPromo(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsApplyingPromo(false);
      toast.error("Invalid promo code. Please try another one.");
    }, 1000);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to complete your purchase", {
        action: {
          label: "Login",
          onClick: () => navigate("/login", { state: { from: "/cart" } }),
        },
      });
      return;
    }
    
    // In a real app, this would redirect to a checkout page or process
    toast.success("Checkout functionality would be implemented here!");
  };

  // Calculate order summary
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const taxes = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + shipping + taxes;

  // Get eco-ratings summary
  const ecoRatings = cart.map(item => item.product.ecoRating);
  const hasLowRatings = ecoRatings.some(rating => rating === "D" || rating === "F");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-eco-charcoal mb-8">Your Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-eco-charcoal mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/products">
              <Button size="lg" className="bg-eco-green hover:bg-eco-green/90">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-eco-charcoal">
                      Items ({cart.reduce((total, item) => total + item.quantity, 0)})
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleClearCart}
                      className="text-gray-500 hover:text-red-500"
                    >
                      Clear Cart
                    </Button>
                  </div>
                  
                  {/* Cart items list */}
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.product._id}>
                        <div className="flex items-center">
                          {/* Product image */}
                          <Link to={`/products/${item.product._id}`} className="flex-shrink-0">
                            <img 
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          </Link>
                          
                          {/* Product details */}
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between mb-1">
                              <Link to={`/products/${item.product._id}`}>
                                <h3 className="font-medium text-eco-charcoal hover:text-eco-green">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <span className="font-medium">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-500 mb-2">
                              <span className="mr-2">{item.product.brand}</span>
                              <EcoBadge rating={item.product.ecoRating} />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              {/* Quantity adjustment */}
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                  className="py-1 px-2 text-gray-600 hover:text-eco-green"
                                  disabled={item.quantity === 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="py-1 px-3 text-sm border-x border-gray-300">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                  className="py-1 px-2 text-gray-600 hover:text-eco-green"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveItem(item.product._id)}
                                className="text-gray-500 hover:text-red-500 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="text-sm">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Eco Rating Warning */}
              {hasLowRatings && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Some items in your cart have low eco-ratings
                      </h3>
                      <p className="mt-2 text-sm text-yellow-700">
                        Consider checking out our greener alternatives for these products to reduce your environmental impact.
                      </p>
                      <div className="mt-3">
                        <Link
                          to="/products?rating=a,b"
                          className="text-sm font-medium text-yellow-800 hover:text-yellow-900 flex items-center"
                        >
                          Browse eco-friendly options
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden sticky top-20">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-eco-charcoal mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated tax</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    
                    {/* Promo code input */}
                    <div className="pt-2">
                      <label htmlFor="promo-code" className="block text-sm text-gray-600 mb-2">
                        Promo Code
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          id="promo-code"
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyPromoCode}
                          disabled={!promoCode || isApplyingPromo}
                        >
                          {isApplyingPromo ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between pt-2">
                      <span className="font-semibold text-eco-charcoal">Total</span>
                      <span className="font-bold text-xl">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-6 bg-eco-green hover:bg-eco-green/90"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                  </Button>
                  
                  {/* Shipping note */}
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {subtotal >= 50 ? (
                      <span className="text-eco-green">You qualify for free shipping!</span>
                    ) : (
                      <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping</span>
                    )}
                  </p>
                  
                  {/* Continue shopping */}
                  <div className="mt-6 text-center">
                    <Link 
                      to="/products"
                      className="text-eco-green hover:text-eco-green/90 text-sm font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
