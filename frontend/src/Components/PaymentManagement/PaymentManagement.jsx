"use client"

import { useState } from "react"
import "./PaymentManagement.css"

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [giftWrap, setGiftWrap] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const subtotal = 139.97
  const shipping = shippingMethod === "express" ? 15.99 : shippingMethod === "overnight" ? 29.99 : 5.99
  const tax = subtotal * 0.08
  const giftWrapFee = giftWrap ? 4.99 : 0
  const total = subtotal + shipping + tax + giftWrapFee

  const steps = [
    { number: 1, title: "Shipping", icon: "🚚" },
    { number: 2, title: "Payment", icon: "💳" },
    { number: 3, title: "Review", icon: "🛡️" },
  ]

  return (
    <div className="checkout-container">
      {/* Progress Indicator */}
      <div className="progress-header">
        <div className="progress-content">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.number} className="step-container">
                <div className={`step-circle ${currentStep >= step.number ? "active" : ""}`}>
                  <span className="step-icon">{step.icon}</span>
                </div>
                <span className={`step-title ${currentStep >= step.number ? "active" : ""}`}>{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`step-line ${currentStep > step.number ? "completed" : ""}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="checkout-grid">
          {/* Main Content */}
          <div className="form-section">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">🚚 Shipping Information</h2>
                </div>
                <div className="card-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input id="firstName" type="text" placeholder="John" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input id="lastName" type="text" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">📧 Email Address</label>
                    <input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">📞 Phone Number</label>
                    <input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">📍 Street Address</label>
                    <input id="address" type="text" placeholder="123 Main Street" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input id="city" type="text" placeholder="Kandy" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">Province</label>
                      <select id="state">
                        <option value="">Select Province</option>
                        <option value="ny">Central</option>
                        <option value="ca">Western</option>
                        <option value="tx">Northern</option>
                        <option value="ny">Eastern</option>
                        <option value="ca">NorthWestern</option>
                        <option value="tx">Uva</option>
                        <option value="ny">Sabaragamuwa</option>
                        <option value="ca">NorthCentral</option>
                        <option value="tx">Southern</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zip">ZIP Code</label>
                      <input id="zip" type="text" placeholder="10001" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <select id="country" defaultValue="us">
                        <option value="us">Sri Lanka </option>
                        <option value="us">United States</option>
                        <option value="ca">Canada</option>
                        <option value="uk">United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  <div className="separator"></div>

                  <div className="shipping-methods">
                    <label className="section-title">Shipping Method</label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="standard"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <label htmlFor="standard">Standard Shipping (5-7 days)</label>
                        <span className="price">$5.99</span>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="express"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <label htmlFor="express">Express Shipping (2-3 days)</label>
                        <span className="price">$15.99</span>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="overnight"
                          name="shipping"
                          value="overnight"
                          checked={shippingMethod === "overnight"}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <label htmlFor="overnight">Overnight Shipping</label>
                        <span className="price">$29.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">💳 Payment Information</h2>
                </div>
                <div className="card-content">
                  <div className="payment-methods">
                    <label className="section-title">Payment Method</label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="card"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="card">Credit/Debit Card</label>
                        <div className="payment-badges">
                          <span className="badge">Visa</span>
                          <span className="badge">MC</span>
                          <span className="badge">Amex</span>
                        </div>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="paypal"
                          name="payment"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="paypal">PayPal</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="apple"
                          name="payment"
                          value="apple"
                          checked={paymentMethod === "apple"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="apple">Apple Pay</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="google"
                          name="payment"
                          value="google"
                          checked={paymentMethod === "google"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="google">Cash On Dilivery</label>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="card-details">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiry">Expiry Date</label>
                          <input id="expiry" type="text" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input id="cvv" type="text" placeholder="123" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardName">Name on Card</label>
                        <input id="cardName" type="text" placeholder="John Doe" />
                      </div>
                      <div className="checkbox-group">
                        <input type="checkbox" id="saveCard" />
                        <label htmlFor="saveCard">Save card for future purchases</label>
                      </div>
                    </div>
                  )}

                  <div className="security-notice">🔒 Your payment information is encrypted and secure</div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">🛡️ Review Your Order</h2>
                </div>
                <div className="card-content">
                  <div className="review-section">
                    <h3>Order Summary</h3>
                    <div className="order-items">
                      <div className="order-item">
                        <span>Premium T-Shirt (2x)</span>
                        <span>$59.98</span>
                      </div>
                      <div className="order-item">
                        <span>Classic Jeans (1x)</span>
                        <span>$79.99</span>
                      </div>
                    </div>
                  </div>

                  <div className="separator"></div>

                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p className="address">
                      John Doe
                      <br />
                      123 Main Street
                      <br />
                      New York, NY 10001
                      <br />
                      United States
                    </p>
                  </div>

                  <div className="separator"></div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p className="payment-info">
                      {paymentMethod === "card" && "Credit Card ending in 3456"}
                      {paymentMethod === "paypal" && "PayPal"}
                      {paymentMethod === "apple" && "Apple Pay"}
                      {paymentMethod === "google" && "Cash On Dilivery"}
                    </p>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label htmlFor="terms">
                      I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </button>
              {currentStep < 3 ? (
                <button className="btn btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Continue
                </button>
              ) : (
                <button className="btn btn-primary" disabled={!agreeTerms}>
                  Place Order
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="sidebar">
            <div className="card sticky">
              <div className="card-header">
                <h2 className="card-title">Order Summary</h2>
              </div>
              <div className="card-content">
                <div className="checkbox-group">
                  <input type="checkbox" id="gift" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
                  <label htmlFor="gift">🎁 Gift wrapping (+$4.99)</label>
                </div>

                {giftWrap && (
                  <div className="form-group">
                    <label htmlFor="giftMessage">Gift Message (Optional)</label>
                    <textarea id="giftMessage" placeholder="Write your gift message here..." rows="3"></textarea>
                  </div>
                )}

                <div className="separator"></div>

                <div className="order-totals">
                  <div className="total-line">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {giftWrap && (
                    <div className="total-line">
                      <span>Gift Wrapping</span>
                      <span>${giftWrapFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="separator"></div>
                  <div className="total-line final-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="security-badges">
                  <div className="security-items">
                    <div className="security-item">
                      <span>🛡️ SSL Secure</span>
                    </div>
                    <div className="security-item">
                      <span>🔒 256-bit Encryption</span>
                    </div>
                  </div>
                  <p className="guarantee">30-day money-back guarantee</p>
                </div>

 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
