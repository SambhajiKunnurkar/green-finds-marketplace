
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, CreditCard, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../utils/authUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { currentUser, demoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      if (demoMode) {
        // In demo mode, simulate a successful checkout
        toast.success("Processing your order...");
        
        // Simulate processing time
        setTimeout(() => {
          setIsLoading(false);
          navigate(`/payment-success?order_id=DEMO123&method=${paymentMethod}`);
        }, 1500);
        
        return;
      }

      // Create an order in the database
      const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ecoCartToken")}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
          })),
          total: cartTotal
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData._id;

      // For COD and UPI, redirect directly to success page
      if (paymentMethod === "cod" || paymentMethod === "upi") {
        const paymentResponse = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("ecoCartToken")}`,
          },
          body: JSON.stringify({ orderId, paymentMethod }),
        });

        if (!paymentResponse.ok) {
          throw new Error("Failed to process payment");
        }

        const paymentData = await paymentResponse.json();
        navigate(paymentData.redirectUrl);
        return;
      }

      // For card payments, redirect to Stripe
      const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ecoCartToken")}`,
        },
        body: JSON.stringify({ orderId, paymentMethod: "card" }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to initiate the checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-eco-charcoal">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-500 mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products">
              <Button className="bg-eco-green hover:bg-eco-green/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.product._id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/4 h-40 bg-gray-100">
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-eco-charcoal">{item.product.name}</h3>
                            <p className="text-gray-500 text-sm mt-1">{item.product.description.substring(0, 100)}...</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto p-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center">
                          <span className="text-eco-green font-semibold text-lg">
                            ${item.product.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Complete your purchase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <RadioGroup defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 mb-3 border p-3 rounded">
                        <RadioGroupItem value="card" id="card" />
                        <label htmlFor="card" className="flex items-center w-full cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2 text-eco-green" />
                          <span>Credit/Debit Card</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 mb-3 border p-3 rounded">
                        <RadioGroupItem value="upi" id="upi" />
                        <label htmlFor="upi" className="flex items-center w-full cursor-pointer">
                          <svg className="h-5 w-5 mr-2 text-eco-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>UPI Payment</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded">
                        <RadioGroupItem value="cod" id="cod" />
                        <label htmlFor="cod" className="flex items-center w-full cursor-pointer">
                          <svg className="h-5 w-5 mr-2 text-eco-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 8.5H7C4.79086 8.5 3 10.2909 3 12.5V15.5C3 17.7091 4.79086 19.5 7 19.5H17C19.2091 19.5 21 17.7091 21 15.5V12.5C21 10.2909 19.2091 8.5 17 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 15.5H9M17 15.5H13M3 10.5L3 6.5C3 4.29086 4.79086 2.5 7 2.5L17 2.5C19.2091 2.5 21 4.29086 21 6.5L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Cash on Delivery</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-eco-green hover:bg-eco-green/90"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : `Confirm Order (${paymentMethod === 'card' ? 'Pay Now' : paymentMethod === 'cod' ? 'Pay on Delivery' : 'UPI Payment'})`}
                  </Button>
                </CardFooter>
              </Card>

              {demoMode && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Demo Mode</AlertTitle>
                  <AlertDescription>
                    You're in demo mode. No real payments will be processed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
