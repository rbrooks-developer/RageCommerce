"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { EasyPostRate, ShippingAddress } from "@/types";

type Step = "address" | "shipping" | "review";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [rates, setRates] = useState<EasyPostRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<EasyPostRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <button
          onClick={() => router.push("/products")}
          className="rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  function validate() {
    const errs: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.name.trim()) errs.name = "Full name is required";
    if (!address.address_line1.trim()) errs.address_line1 = "Address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state) errs.state = "State is required";
    if (!address.zip.trim() || address.zip.trim().length < 5) errs.zip = "Valid ZIP code required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function fetchRates() {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch shipping rates");
      setRates(data.rates);
      setSelectedRate(data.rates[0] ?? null);
      setStep("shipping");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startPayment() {
    if (!selectedRate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), shippingAddress: address, shippingRate: selectedRate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      clearCart();
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const shippingCost = selectedRate ? parseFloat(selectedRate.rate) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm mb-8">
        {(["address", "shipping", "review"] as Step[]).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">›</span>}
            <span className={step === s ? "font-semibold text-gray-900" : "text-gray-400 capitalize"}>
              {s === "address" ? "Address" : s === "shipping" ? "Shipping" : "Review"}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: step content */}
        <div className="flex-1">
          {/* Step 1: Address */}
          {step === "address" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Shipping Address</h2>

              {[
                { key: "name" as const, label: "Full Name", placeholder: "Jane Smith" },
                { key: "address_line1" as const, label: "Address", placeholder: "123 Main St" },
                { key: "address_line2" as const, label: "Apt, Suite, etc. (optional)", placeholder: "" },
                { key: "city" as const, label: "City", placeholder: "New York" },
                { key: "zip" as const, label: "ZIP Code", placeholder: "10001" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={address[key] ?? ""}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      fieldErrors[key] ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {fieldErrors[key] && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  className={`w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white ${
                    fieldErrors.state ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {fieldErrors.state && <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>}
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>}

              <button
                onClick={fetchRates}
                disabled={loading}
                className="w-full rounded-md bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Spinner className="h-4 w-4" />}
                {loading ? "Getting rates…" : "Continue to Shipping"}
              </button>
            </div>
          )}

          {/* Step 2: Shipping rates */}
          {step === "shipping" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Select Shipping</h2>
                <button onClick={() => setStep("address")} className="text-xs text-gray-400 hover:text-gray-600">
                  ← Edit address
                </button>
              </div>

              <p className="text-sm text-gray-500">{address.address_line1}, {address.city}, {address.state} {address.zip}</p>

              {rates.length === 0 ? (
                <p className="text-sm text-gray-400">No rates available for this address.</p>
              ) : (
                <div className="space-y-2">
                  {rates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center gap-3 rounded-md border p-3.5 cursor-pointer transition-colors ${
                        selectedRate?.id === rate.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_rate"
                        value={rate.id}
                        checked={selectedRate?.id === rate.id}
                        onChange={() => setSelectedRate(rate)}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {rate.carrier} {rate.service}
                        </p>
                        {rate.delivery_days != null && (
                          <p className="text-xs text-gray-400">
                            {rate.delivery_days} business {rate.delivery_days === 1 ? "day" : "days"}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatPrice(parseFloat(rate.rate) * 100)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep("review")}
                disabled={!selectedRate}
                className="w-full rounded-md bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Continue to Review
              </button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Review Your Order</h2>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Shipping to</p>
                <p className="text-sm text-gray-700">
                  {address.name}<br />
                  {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}<br />
                  {address.city}, {address.state} {address.zip}
                </p>
                <button onClick={() => setStep("address")} className="mt-1 text-xs text-blue-600 hover:underline">Edit</button>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Shipping method</p>
                <p className="text-sm text-gray-700">
                  {selectedRate?.carrier} {selectedRate?.service} — {formatPrice(parseFloat(selectedRate?.rate ?? "0") * 100)}
                </p>
                <button onClick={() => setStep("shipping")} className="mt-1 text-xs text-blue-600 hover:underline">Edit</button>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Items</p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.productId} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity * 100)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>}

              <button
                onClick={startPayment}
                disabled={loading}
                className="w-full rounded-md bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Spinner className="h-4 w-4" />}
                {loading ? "Redirecting to payment…" : "Pay Now"}
              </button>

              <p className="text-xs text-gray-400 text-center">You'll be redirected to Stripe's secure payment page.</p>
            </div>
          )}
        </div>

        {/* Right: order summary (always visible) */}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-lg border border-gray-200 bg-white p-5 sticky top-24 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Order Summary</h3>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.price * item.quantity * 100)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal * 100)}</span>
              </div>
              {selectedRate && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(parseFloat(selectedRate.rate) * 100)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice((subtotal + shippingCost) * 100)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
