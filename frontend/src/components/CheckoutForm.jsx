import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Star } from "lucide-react";

const CheckoutForm = ({
  onPaymentSuccess,
  amount,
  isProcessing,
  setIsProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-800">
        <PaymentElement
          options={{
            layout: "tabs",
            theme: "night",
            variables: {
              colorPrimary: "#ffffff",
              colorBackground: "transparent",
              colorText: "#ffffff",
              colorDanger: "#df1b41",
              fontFamily: "Inter, system-ui, sans-serif",
              spacingGridRow: "16px",
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20">
          {errorMessage}
        </div>
      )}

      <button
        disabled={!stripe || isProcessing}
        className="w-full bg-white text-neutral-900 font-bold py-5 rounded-2xl hover:bg-neutral-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Pay ₹{amount} & Register</span>
            <Star size={18} fill="currentColor" />
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;
