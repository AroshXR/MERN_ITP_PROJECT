"use client"

import { useState } from "react"
import axios from "axios"
import "./PaymentManagement.css"

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [giftWrap, setGiftWrap] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // Form data state
  const [formData, setFormData] = useState({
    // Delivery Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Sri Lanka",
    
    // Card Details (only when payment method is card)
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    saveCard: false,
    
    // Gift message
    giftMessage: ""
  })

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Validate form data
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return false
    }

    // Validate phone number
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      alert('Please enter a valid phone number')
      return false
    }

    // If payment method is card, validate card details
    if (paymentMethod === 'card') {
      const cardRequiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName']
      for (const field of cardRequiredFields) {
        if (!formData[field].trim()) {
          alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
          return false
        }
      }

      // Validate card number (basic validation)
      const cardNumber = formData.cardNumber.replace(/\s/g, '')
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number')
        return false
      }

      // Validate expiry date
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
      if (!expiryRegex.test(formData.expiryDate)) {
        alert('Please enter expiry date in MM/YY format')
        return false
      }

      // Validate CVV
      const cvvRegex = /^\d{3,4}$/
      if (!cvvRegex.test(formData.cvv)) {
        alert('Please enter a valid CVV (3-4 digits)')
        return false
      }
    }

    return true
  }

  // Submit payment details to backend
  const handleSubmitPayment = async () => {
    if (!validateForm()) {
      return
    }

    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions and Privacy Policy')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      // Prepare payment data
      const paymentData = {
        deliveryDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        shippingDetails: {
          method: shippingMethod,
          cost: shipping
        },
        paymentDetails: {
          method: paymentMethod,
          cardDetails: paymentMethod === 'card' ? {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
            cardName: formData.cardName,
            saveCard: formData.saveCard
          } : {}
        },
        orderDetails: {
          subtotal: subtotal,
          tax: tax,
          giftWrap: giftWrap,
          giftWrapFee: giftWrapFee,
          total: total
        },
        giftMessage: formData.giftMessage,
        userId: null // You can add user authentication later
      }

      console.log('Submitting payment data:', paymentData)

      // Send to backend
      const response = await axios.post('http://localhost:5001/payment', paymentData)
      
      if (response.data.status === 'ok') {
        setSubmitMessage(`Payment details saved successfully! Payment ID: ${response.data.data.paymentId}`)
        // Reset form or redirect to success page
        setTimeout(() => {
          // You can redirect to a success page or reset the form
          window.location.reload()
        }, 3000)
      } else {
        setSubmitMessage('Error saving payment details: ' + response.data.message)
      }

    } catch (error) {
      console.error('Error submitting payment:', error)
      setSubmitMessage('Error saving payment details: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

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
                      <input 
                        id="firstName" 
                        name="firstName"
                        type="text" 
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input 
                        id="lastName" 
                        name="lastName"
                        type="text" 
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">📧 Email Address</label>
                    <input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">📞 Phone Number</label>
                    <input 
                      id="phone" 
                      name="phone"
                      type="tel" 
                      placeholder="+94 77 123 4567" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">📍 Street Address</label>
                    <input 
                      id="address" 
                      name="address"
                      type="text" 
                      placeholder="123 Main Street" 
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input 
                        id="city" 
                        name="city"
                        type="text" 
                        placeholder="Kandy" 
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">Province</label>
                      <select 
                        id="state" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Province</option>
                        <option value="Central">Central</option>
                        <option value="Western">Western</option>
                        <option value="Northern">Northern</option>
                        <option value="Eastern">Eastern</option>
                        <option value="NorthWestern">NorthWestern</option>
                        <option value="Uva">Uva</option>
                        <option value="Sabaragamuwa">Sabaragamuwa</option>
                        <option value="NorthCentral">NorthCentral</option>
                        <option value="Southern">Southern</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zipCode">ZIP Code</label>
                      <input 
                        id="zipCode" 
                        name="zipCode"
                        type="text" 
                        placeholder="20000" 
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <select 
                        id="country" 
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
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
                        <input 
                          id="cardNumber" 
                          name="cardNumber"
                          type="text" 
                          placeholder="1234 5678 9012 3456" 
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input 
                            id="expiryDate" 
                            name="expiryDate"
                            type="text" 
                            placeholder="MM/YY" 
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input 
                            id="cvv" 
                            name="cvv"
                            type="text" 
                            placeholder="123" 
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardName">Name on Card</label>
                        <input 
                          id="cardName" 
                          name="cardName"
                          type="text" 
                          placeholder="John Doe" 
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="checkbox-group">
                        <input 
                          type="checkbox" 
                          id="saveCard" 
                          name="saveCard"
                          checked={formData.saveCard}
                          onChange={handleInputChange}
                        />
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
                <button 
                  className="btn btn-primary" 
                  disabled={!agreeTerms || isSubmitting}
                  onClick={handleSubmitPayment}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
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
                    <textarea 
                      id="giftMessage" 
                      name="giftMessage"
                      placeholder="Write your gift message here..." 
                      rows="3"
                      value={formData.giftMessage}
                      onChange={handleInputChange}
                    ></textarea>
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

      {/* Submit Message */}
      {submitMessage && (
        <div className="submit-message" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 20px',
          borderRadius: '8px',
          backgroundColor: submitMessage.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: submitMessage.includes('successfully') ? '#155724' : '#721c24',
          border: `1px solid ${submitMessage.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
          zIndex: 1000,
          maxWidth: '400px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {submitMessage}
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
