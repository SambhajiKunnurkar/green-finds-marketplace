
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { API_BASE_URL } from "../utils/authUtils";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { token, demoMode } = useAuth();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();

    // Show confirmation toast
    toast.success("Payment successful! Thank you for your order.");

    // If not in demo mode and we have a session ID, confirm payment with the server
    const confirmPayment = async () => {
      if (!demoMode && sessionId) {
        try {
          const response = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            console.error("Payment confirmation failed");
          }
        } catch (error) {
          console.error("Error confirming payment:", error);
        }
      }
    };

    confirmPayment();
  }, [sessionId, clearCart, token, demoMode]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-eco-charcoal mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be shipped soon.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-eco-charcoal mb-4">
            Order Summary
          </h2>
          <p className="text-gray-600 mb-4">
            {demoMode ? "Demo Order #DEMO123456" : `Order #${sessionId ? sessionId.substring(0, 8) : "Unknown"}`}
          </p>
          <p className="text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/products">
            <Button className="w-full sm:w-auto bg-eco-green hover:bg-eco-green/90">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="w-full sm:w-auto">
              View Your Orders
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
