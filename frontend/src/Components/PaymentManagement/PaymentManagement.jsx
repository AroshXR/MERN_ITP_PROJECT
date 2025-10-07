"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./PaymentManagement.css"
import { useAuth } from '../../AuthGuard/AuthGuard'
import { useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, getToken, logout } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [giftWrap, setGiftWrap] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})

  // Cart and pricing state
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartError, setCartError] = useState(null)
  const [ignoreEmptyCart, setIgnoreEmptyCart] = useState(false) // avoids empty-cart error after order

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

  // Calculate pricing from cart items
  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const shipping = cartItems.length > 0 ? (shippingMethod === "express" ? 15.99 : shippingMethod === "overnight" ? 29.99 : 5.99) : 0
  const tax = subtotal * 0.08
  const giftWrapFee = giftWrap ? 4.99 : 0
  const total = subtotal + shipping + tax + giftWrapFee

  const steps = [
    { number: 1, title: "Shipping", icon: "🚚" },
    { number: 2, title: "Payment", icon: "💳" },
    { number: 3, title: "Review", icon: "🛡️" },
  ]

  // Clear all cart items for the authenticated user
  const clearCart = async () => {
    try {
      const authToken = getToken()
      if (!authToken) return

      // Fetch latest items to ensure we have real Mongo _ids
      const listRes = await axios.get('http://localhost:5001/cloth-customizer', {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      const items = Array.isArray(listRes.data?.data) ? listRes.data.data : []
      if (!items.length) {
        setCartItems([])
        return
      }

      // Delete each item in parallel (best-effort)
      await Promise.allSettled(
        items.map((it) =>
          axios.delete(`http://localhost:5001/cloth-customizer/${it._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        )
      )

      // Update local state
      setCartItems([])
    } catch (err) {
      console.error('Error clearing cart:', err)
      // Fail silently to not block success flow
    }
  }

  // Fetch cart items on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      setCartError('Please log in to proceed with checkout.')
      setLoading(false)
      navigate('/login')
      return
    }
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const authToken = getToken()
      if (!authToken) {
        setCartError('Authentication required. Please log in.')
        navigate('/login')
        return
      }

      const response = await axios.get('http://localhost:5001/cloth-customizer', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (response.data.status === "ok") {
        const transformedItems = response.data.data.map((item, index) => ({
          id: item._id || `item-${index}`,
          name: `Custom ${item.clothingType || 'Clothing'}`,
          price: item.totalPrice && item.quantity ? (item.totalPrice / item.quantity) : (item.totalPrice || 0),
          quantity: item.quantity || 1,
          size: item.size || 'Standard',
          color: item.color || 'Default',
          clothingType: item.clothingType || 'tshirt',
          selectedDesign: item.selectedDesign || null,
          placedDesigns: item.placedDesigns || [],
          totalPrice: item.totalPrice || 0,
          createdAt: item.createdAt || new Date().toISOString()
        }))

        setCartItems(transformedItems)

        if (transformedItems.length === 0) {
          // Show empty-cart error only when not in post-payment cleanup flow
          if (!ignoreEmptyCart) {
            setCartError('Your cart is empty. Please add items to your cart before proceeding to checkout.')
          } else {
            setCartError(null)
          }
        }
      } else {
        setCartError('Failed to fetch cart items')
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)

      if (error.response?.status === 401) {
        logout()
        setCartError('Your session has expired. Please log in again.')
        navigate('/login')
        return
      }

      setCartError('Failed to load cart items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Helpers for formatting
  const formatCardNumber = (raw) => raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }
  const formatPhone = (raw) => raw.replace(/[^\d+\s]/g, '').slice(0, 18)

  // Per-field validators
  const luhnCheck = (num) => {
    const str = num.replace(/\s+/g, '')
    if (!str) return false
    let sum = 0, shouldDouble = false
    for (let i = str.length - 1; i >= 0; i--) {
      let digit = parseInt(str[i], 10)
      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      shouldDouble = !shouldDouble
    }
    return sum % 10 === 0
  }

  const isExpiryValid = (mmYY) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(mmYY)) return false
    const [mm, yy] = mmYY.split('/')
    const expMonth = parseInt(mm, 10)
    const expYear = 2000 + parseInt(yy, 10)
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const expDate = new Date(expYear, expMonth - 1, 1)
    return expDate >= thisMonth
  }

  const validateField = (name, value, current = formData) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'This field is required'
        if (value.length > 50) return 'Too long (max 50)'
        return ''
      case 'email': {
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? '' : 'Enter a valid email address'
      }
      case 'phone': {
        if (!value.trim()) return 'Phone number is required'
        const phoneRegex = /^[\+]?\d[\d\s]{6,15}$/
        return phoneRegex.test(value) ? '' : 'Enter a valid phone number'
      }
      case 'address':
        if (!value.trim()) return 'Address is required'
        if (value.trim().length < 5) return 'Address is too short'
        return ''
      case 'city':
        return value.trim() ? '' : 'City is required'
      case 'state':
        return value ? '' : 'Province is required'
      case 'zipCode': {
        if (!value.trim()) return 'ZIP code is required'
        const zipRegex = /^\d{5}$/
        return zipRegex.test(value) ? '' : 'ZIP must be 5 digits'
      }
      case 'cardNumber': {
        if (paymentMethod !== 'card') return ''
        const onlyDigits = value.replace(/\s+/g, '')
        if (onlyDigits.length < 13 || onlyDigits.length > 19) return 'Card number length is invalid'
        return luhnCheck(value) ? '' : 'Card number failed validation'
      }
      case 'expiryDate':
        if (paymentMethod !== 'card') return ''
        return isExpiryValid(value) ? '' : 'Expiry must be in the future (MM/YY)'
      case 'cvv':
        if (paymentMethod !== 'card') return ''
        return /^\d{3,4}$/.test(value) ? '' : 'CVV must be 3-4 digits'
      case 'cardName':
        if (paymentMethod !== 'card') return ''
        return value.trim() ? '' : 'Name on card is required'
      default:
        return ''
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name } = e.target
    let { value, type, checked } = e.target

    // Formatting for specific fields
    if (name === 'cardNumber') value = formatCardNumber(value)
    if (name === 'expiryDate') value = formatExpiry(value)
    if (name === 'phone') value = formatPhone(value)

    const nextValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: nextValue }))

    // Live-validate this field
    const error = validateField(name, nextValue, { ...formData, [name]: nextValue })
    setFormErrors(prev => ({ ...prev, [name]: error }))
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
          total: total,
          cartItems: cartItems
        },
        giftMessage: formData.giftMessage,
        userId: getToken() ? JSON.parse(atob(getToken().split('.')[1])).userId : null
      }

      console.log('Submitting payment data:', paymentData)

      // Send to backend
      const response = await axios.post('http://localhost:5001/payment', paymentData, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })

      if (response.data.status === 'ok') {
        const { paymentId, orders, totalOrders } = response.data.data
        let successMessage = `Payment successful! Payment ID: ${paymentId}`
        
        if (orders && totalOrders > 0) {
          successMessage += `\n${totalOrders} order(s) created:`
          orders.forEach(order => {
            successMessage += `\n• ${order.itemName} (Qty: ${order.quantity}) - Order ID: ${order.orderId}`
          })
        }
        
        setSubmitMessage(successMessage)

        // Prevent showing empty-cart error during post-payment cleanup
        setIgnoreEmptyCart(true)
        setCartError(null)

        // Clear the cart after successful payment
        await clearCart()

        // Optionally also reset form states
        setGiftWrap(false)
        setShippingMethod('standard')
        setPaymentMethod('card')
        setAgreeTerms(false)

        // Navigate to launching home
        navigate('/')
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

  // Show loading state
  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="loading-spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite'
          }}></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (cartError) {
    return (
      <div className="checkout-container">
        <div className="error-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            maxWidth: '500px'
          }}>
            <h3>⚠️ Checkout Error</h3>
            <p>{cartError}</p>
            <div style={{ marginTop: '20px', gap: '10px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/orderManagement')}
                className="btn btn-outline"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go to Cart
              </button>
              <button
                onClick={fetchCartItems}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      {/* Back Button */}
      <div className="back-button-container">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            border: '2px solid #333',
            borderRadius: '8px',
            color: '#333',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#333';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#333';
          }}
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

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
                        aria-invalid={!!formErrors.firstName}
                        required
                      />
                      {formErrors.firstName && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.firstName}</div>)}
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
                        aria-invalid={!!formErrors.lastName}
                        required
                      />
                      {formErrors.lastName && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.lastName}</div>)}
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
                      aria-invalid={!!formErrors.email}
                      required
                    />
                    {formErrors.email && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.email}</div>)}
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
                      aria-invalid={!!formErrors.phone}
                      required
                    />
                    {formErrors.phone && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.phone}</div>)}
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
                      aria-invalid={!!formErrors.address}
                      required
                    />
                    {formErrors.address && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.address}</div>)}
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
                        aria-invalid={!!formErrors.city}
                        required
                      />
                      {formErrors.city && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.city}</div>)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">Province</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        aria-invalid={!!formErrors.state}
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
                        aria-invalid={!!formErrors.zipCode}
                        required
                      />
                      {formErrors.zipCode && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.zipCode}</div>)}
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
                          aria-invalid={!!formErrors.cardNumber}
                          required
                        />
                        {formErrors.cardNumber && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.cardNumber}</div>)}
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
                            aria-invalid={!!formErrors.expiryDate}
                            required
                          />
                          {formErrors.expiryDate && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.expiryDate}</div>)}
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
                            aria-invalid={!!formErrors.cvv}
                            required
                          />
                          {formErrors.cvv && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.cvv}</div>)}
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
                          aria-invalid={!!formErrors.cardName}
                          required
                        />
                        {formErrors.cardName && (<div style={{color:'#b91c1c', fontSize:'12px', marginTop:4}}>{formErrors.cardName}</div>)}
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
                      {cartItems.map((item) => (
                        <div key={item.id} className="order-item">
                          <span>
                            {item.name} - {item.size}
                             <div
                              className="color-palette"
                              style={{
                                backgroundColor: item.color,
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                border: "1px solid #ccc",
                              }}
                              title={item.color}
                            /> ({item.quantity}x)
                          </span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {cartItems.length === 0 && (
                        <div className="order-item">
                          <span>No items in cart</span>
                          <span>$0.00</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="separator"></div>

                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p className="address" style={{fontSize:"12px"}}>
                      {formData.firstName} {formData.lastName}
                      <br />
                      {formData.address}
                      <br />
                      {formData.city}, {formData.state} {formData.zipCode}
                      <br />
                      {formData.country}
                      <br />
                      📧 {formData.email}
                      <br />
                      📞 {formData.phone}
                    </p>
                  </div>

                  <div className="separator"></div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p className="payment-info" style={{fontSize:"12px"}}>
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
                <button className="btn" onClick={() => setCurrentStep(currentStep + 1)}>
                  Continue
                </button>
              ) : (
                <button
                  className="supbtn"
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
                <h2 className="card-title" style={{color:"ash"}}>Order Summary</h2>
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
          backgroundColor: submitMessage.includes('successful') ? '#d4edda' : '#f8d7da',
          color: submitMessage.includes('successful') ? '#155724' : '#721c24',
          border: `1px solid ${submitMessage.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
          zIndex: 1000,
          maxWidth: '500px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          whiteSpace: 'pre-line',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {submitMessage}
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
