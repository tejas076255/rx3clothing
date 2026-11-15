import { useState } from "react";
import { fakePay, formatINR } from "../api.js";

/**
 * Demo payment gateway modal ("RX3 SecurePay"). Collects UPI / card details,
 * shows a short processing state, then calls the backend's fake-pay endpoint.
 * onSuccess({ paymentId, order }) fires from the success screen's Done button;
 * onClose dismisses without paying (the order stays PENDING_PAYMENT).
 */
export default function PaymentModal({ order, method, onSuccess, onClose }) {
  const [phase, setPhase] = useState("form"); // form | processing | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [paidOrder, setPaidOrder] = useState(null);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const pay = async () => {
    setErrorMsg("");
    if (method === "UPI" && (upiId.trim().length < 6 || !upiId.includes("@"))) {
      setErrorMsg("Enter a valid UPI ID (e.g. name@okhdfc).");
      return;
    }
    if (method === "CARD") {
      if (card.number.replace(/\s/g, "").length !== 16) {
        setErrorMsg("Enter a valid 16-digit card number.");
        return;
      }
      if (!card.name.trim() || card.expiry.length < 5 || card.cvv.length < 3) {
        setErrorMsg("Fill in the card name, expiry (MM/YY) and CVV.");
        return;
      }
    }
    setPhase("processing");
    // Simulated gateway round-trip, then the real (fake) backend call.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const data = await fakePay({
        orderId: order.orderId,
        method,
        upiId: method === "UPI" ? upiId.trim() : undefined,
        cardNumber: method === "CARD" ? card.number : undefined,
      });
      setPaymentId(data.paymentId);
      setPhase("success");
      setPaidOrder(data.order);
    } catch (err) {
      setErrorMsg(err.message || "Payment failed. Please try again.");
      setPhase("error");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm grid place-items-center px-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-up">
        <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-display font-bold tracking-wide">RX3 SecurePay</p>
            <p className="text-[11px] text-neutral-400">Demo Gateway — no real money moves</p>
          </div>
          <span className="text-xs font-semibold bg-white/10 border border-white/20 rounded-full px-3 py-1">
            🔒 Secure
          </span>
        </div>

        <div className="px-6 py-5">
          <div className="flex justify-between text-sm bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
            <span className="text-neutral-500">Order {order.orderId}</span>
            <span className="font-bold">{formatINR(order.total)}</span>
          </div>

          {phase === "processing" && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 mx-auto border-4 border-neutral-200 border-t-ink rounded-full animate-spin" />
              <p className="mt-4 font-semibold">Processing payment…</p>
              <p className="text-xs text-neutral-500 mt-1">Talking to your bank (not really — it's a demo).</p>
            </div>
          )}

          {phase === "success" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto bg-ink text-white rounded-full grid place-items-center text-3xl">
                ✓
              </div>
              <p className="mt-4 font-display text-2xl font-bold">Payment successful</p>
              <p className="text-sm text-neutral-500 mt-1">
                Payment ID: <span className="font-semibold text-ink">{paymentId}</span>
              </p>
              <button
                onClick={() => onSuccess({ paymentId, order: paidOrder || order })}
                className="mt-6 w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition"
              >
                Done
              </button>
            </div>
          )}

          {(phase === "form" || phase === "error") && (
            <>
              {phase === "error" && (
                <div className="mt-4 bg-neutral-100 border border-neutral-300 rounded-2xl px-4 py-3 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {method === "UPI" ? (
                <div className="mt-5">
                  <label className="text-sm font-semibold block mb-1.5">UPI ID</label>
                  <input
                    className={inputCls}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfc"
                    autoComplete="off"
                  />
                  <p className="text-xs text-neutral-400 mt-1.5">
                    A collect request would be sent to this ID in a real gateway.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Card number</label>
                    <input
                      className={inputCls}
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Name on card</label>
                    <input
                      className={inputCls}
                      value={card.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Full name"
                      autoComplete="cc-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Expiry</label>
                      <input
                        className={inputCls}
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">CVV</label>
                      <input
                        className={inputCls}
                        type="password"
                        value={card.cvv}
                        onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="•••"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
              )}

              {phase === "form" && errorMsg && (
                <p className="mt-3 text-sm font-medium">{errorMsg}</p>
              )}

              <button
                onClick={pay}
                className="mt-6 w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition"
              >
                {phase === "error" ? "Retry Payment" : `Pay ${formatINR(order.total)}`}
              </button>
              <button
                onClick={onClose}
                className="mt-2 w-full text-sm font-semibold text-neutral-500 py-2 hover:text-ink transition"
              >
                Cancel — pay later
              </button>

              <div className="mt-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl px-4 py-3 text-xs text-neutral-500 space-y-1">
                <p className="font-semibold text-neutral-600">Demo test values</p>
                <p>✅ Success card: 4111 1111 1111 1111 (any name / expiry / CVV)</p>
                <p>❌ Decline card: 4000 0000 0000 0002</p>
                <p>UPI: any ID containing "@" works, e.g. test@okhdfc</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
