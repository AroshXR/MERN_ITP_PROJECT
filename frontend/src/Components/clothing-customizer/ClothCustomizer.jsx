import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './ClothCustomizer.css';
import { TShirtModel } from './components/TShirtModel';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthGuard/authGuard';
//
import print1 from './customizer_preset_designs/print 1.jpg'
import print2 from './customizer_preset_designs/print 2.jpg'
import print3 from './customizer_preset_designs/print 3.jpg'
import print4 from './customizer_preset_designs/print 4.jpg'
import print5 from './customizer_preset_designs/print 5.jpg'
import print6 from './customizer_preset_designs/print 6.jpg'
import { Link } from 'react-router-dom';


function ClothCustomizer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, getToken, currentUser, logout } = useAuth();
  const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
  const [editingItemId, setEditingItemId] = useState(null);

  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [clothingType, setClothingType] = useState("tshirt");
  const [designSize, setDesignSize] = useState(80);
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [showCartButton, setShowCartButton] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Function to fetch cart items count (authentication disabled for testing)
  const fetchCartCount = async () => {
    console.log('Fetching cart count - Authentication disabled for testing');
    
    // Temporarily disabled authentication check
    // if (isAuthenticated()) {
    try {
      console.log('Proceeding with cart fetch without authentication');
      
      const response = await axios.get('http://localhost:5001/cloth-customizer');
      console.log('Cart fetch response:', response.data);
      
      if (response.data.status === "ok") {
        setCartItemsCount(response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemsCount(0);
    }
    // } else {
    //   console.log('User not authenticated, setting cart count to 0');
    //   setCartItemsCount(0);
    // }
  };

  // Load edit data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadEditData();
    } else {
      fetchCartCount();
    }
  }, [isEditMode]);

  // Fetch cart count when authentication state changes
  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated]);

  // Function to close login prompt
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  // Function to handle overlay click (close prompt when clicking outside)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeLoginPrompt();
    }
  };

  const loadEditData = () => {
    try {
      const editData = localStorage.getItem('editItemData');
      if (editData) {
        const itemData = JSON.parse(editData);
        setEditingItemId(itemData._id);

        // Load the existing data into the form
        setSelectedColor(itemData.color || "#ffffff");
        setClothingType(itemData.clothingType || "tshirt");
        setSelectedSize(itemData.size);
        setQuantity(itemData.quantity);
        setDesignSize(itemData.selectedDesign?.size || 80);
        setDesignPosition(itemData.selectedDesign?.position || { x: 0, y: 0 });

        // Load selected design
        if (itemData.selectedDesign) {
          setSelectedDesign(itemData.selectedDesign);
        }

        // Load placed designs
        if (itemData.placedDesigns && itemData.placedDesigns.length > 0) {
          setFrontDesigns(itemData.placedDesigns);
        }

        // Clear the localStorage
        localStorage.removeItem('editItemData');
      }
    } catch (error) {
      console.error('Error loading edit data:', error);
      alert('Failed to load item data for editing.');
    }
  };

  // Function to clear the form
  const clearForm = () => {
    setSelectedColor("#ffffff");
    setSelectedDesign(null);

    setFrontDesigns([]);
    setDesignSize(80);
    setSelectedSize(null);
    setQuantity(1);
    setDesignPosition({ x: 0, y: 0 });
    setActiveDesignId(null);
    setShowCartButton(false);
    setEditingItemId(null);

    // Reset URL if in edit mode
    if (isEditMode) {
      window.history.replaceState({}, '', '/customizer');
    }
  };

  //Inputing design
  const [selectedSide] = useState("front"); // front or back
  const [frontDesigns, setFrontDesigns] = useState([]);
  const [activeDesignId, setActiveDesignId] = useState(null);

  const controlsRef = React.useRef();
  const [selectedSize, setSelectedSize] = useState(null);

  // Sample preset designs
  const presetDesigns = [
    { id: 1, name: "Design 1", price: 15, preview: print1 },
    { id: 2, name: "Design 2", price: 20, preview: print2 },
    { id: 3, name: "Design 3", price: 18, preview: print3 },
    { id: 4, name: "Design 4", price: 12, preview: print4 },
    { id: 5, name: "Design 5", price: 10, preview: print5 },
    { id: 6, name: "Design 6", price: 8, preview: print6 },
  ];

  const colors = [
    "#f5f5f5",
    "#2e2e2e",
    "#e57373",
    "#81c784",
    "#64b5f6",
    "#fff176",
    "#ba68c8",
    "#4dd0e1"
  ];


  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);

        // Upload image to backend
        const uploadResponse = await axios.post('http://localhost:5001/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.status === "ok") {
          const imageUrl = `http://localhost:5001${uploadResponse.data.data.url}`;

          const customDesign = {
            id: `custom-${Date.now()}`,
            name: "Custom Image",
            price: 25,
            preview: imageUrl,
            position: designPosition,
            size: designSize,
            isCustomUpload: true
          };

          setSelectedDesign(customDesign);
        } else {
          alert('Failed to upload image. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);

    const designWithPlacement = {
      ...design,
      id: `${design.id}-${Date.now()}`,
      side: selectedSide,
      position: { x: 0, y: 0 },
      size: designSize,
    };

    setFrontDesigns((prev) => [...prev, designWithPlacement]);
    setActiveDesignId(designWithPlacement.id);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };






  const updateDesignProperty = (designId, property, value) => {
    const updateDesign = (designs) =>
      designs.map(design =>
        design.id === designId ? { ...design, [property]: value } : design
      );

    setFrontDesigns(prev => updateDesign(prev));

  };

  const getSizeExtraPrice = () => {
    if (selectedSize === "L") return 3;
    if (selectedSize === "XL") return 5;
    if (selectedSize === "XXL") return 8;
    return 0;
  };

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value) => {
    if (value >= 1) setQuantity(value);
  };

  // Calculate total price including placed designs

  const basePrice = clothingType === "tshirt" ? 25 : 35;
  const designPrice = selectedDesign ? selectedDesign.price : 0;
  const sizeExtraPrice = getSizeExtraPrice();
  const totalPrice = basePrice + designPrice + sizeExtraPrice;

  const saveClothCustomizer = async () => {
    console.log('Save function called - Authentication disabled for testing');
    
    // Temporarily disabled authentication check
    // if (!isAuthenticated()) {
    //   console.log('User not authenticated, showing login prompt');
    //   setShowLoginPrompt(true);
    //   return;
    // }

    try {
      // Validate required fields
      if (!selectedSize) {
        alert('Please select a size before saving.');
        return;
      }

      if (quantity < 1) {
        alert('Please select a valid quantity.');
        return;
      }

      if (totalPrice <= 0) {
        alert('Invalid total price. Please check your selections.');
        return;
      }

      setIsSaving(true);

      const clothCustomizerData = {
        clothingType: clothingType,
        color: selectedColor,
        selectedDesign: selectedDesign ? {
          id: selectedDesign.id,
          name: selectedDesign.name,
          price: selectedDesign.price,
          preview: selectedDesign.preview,
          position: designPosition,
          size: designSize,
          isCustomUpload: selectedDesign.isCustomUpload || false
        } : null,
        placedDesigns: frontDesigns.map(design => ({
          id: design.id,
          name: design.name,
          price: design.price,
          preview: design.preview,
          side: design.side || "front",
          position: design.position || { x: 0, y: 0 },
          size: design.size || designSize,
          isCustomUpload: design.isCustomUpload || false
        })),
        size: selectedSize,
        quantity: quantity,
        totalPrice: totalPrice * quantity
      };

      console.log('Sending data to backend:', clothCustomizerData);
      console.log('Authentication disabled - proceeding without token');

      let response;

      if (isEditMode && editingItemId) {
        // Update existing item
        console.log('Updating existing item:', editingItemId);
        response = await axios.put(`http://localhost:5001/cloth-customizer/${editingItemId}`, clothCustomizerData);
      } else {
        // Create new item
        console.log('Creating new item');
        response = await axios.post('http://localhost:5001/cloth-customizer', clothCustomizerData);
      }

      console.log('Backend response:', response.data);

      if (response.data.status === "ok") {
        const action = isEditMode ? 'updated' : 'saved';
        setShowCartButton(true);
        setCartItemsCount(prev => isEditMode ? prev : prev + 1);
        alert(`Cloth customizer data ${action} successfully!`);

        // If editing, clear edit mode
        if (isEditMode) {
          setEditingItemId(null);
          // Reset URL without page reload
          window.history.replaceState({}, '', '/customizer');
        }
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'save'} cloth customizer data.`);
      }
    } catch (error) {
      console.error('Error saving cloth customizer:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'save'} cloth customizer data. Please try again.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="customizer-container">
      <NavBar />
      <div className="customizer-content">
        <div className="customizer-header">
          <h1>Clothing Customizer</h1>
          <div className="header-controls">
            {isEditMode && (
              <div className="edit-mode-badge">
                <span>✏️ Edit Mode</span>
              </div>
            )}
            <div className="auth-status">
              {isAuthenticated() ? (
                <div className="user-info">
                  <span>Welcome, {currentUser?.username || 'User'}!</span>
                  <button 
                    className="logout-btn"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    Logout
                  </button>
                  {/* <button 
                    className="debug-btn"
                    onClick={() => {
                      console.log('=== DEBUG INFO ===');
                      console.log('isAuthenticated():', isAuthenticated());
                      console.log('token:', getToken());
                      console.log('currentUser:', currentUser);
                      console.log('localStorage token:', localStorage.getItem('token'));
                      console.log('==================');
                    }}
                    style={{ fontSize: '12px', padding: '4px 8px', marginLeft: '10px' }}
                  >
                    Debug
                  </button> */}
                </div>
              ) : (
                <div className="guest-info">
                  <span>Guest User - Login to save designs</span>
                  <div className="guest-actions">
                    <button 
                      className="login-btn"
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </button>
                    <button 
                      className="register-btn"
                      onClick={() => navigate('/register')}
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isEditMode ? (
            <p>Edit your existing clothing design</p>
          ) : (
            <p>Design your perfect outfit with our easy-to-use customizer</p>
          )}
        </div>
        {/* Cloth type changer */}
        <div className="customizer-main">
          <div className="customizer-panel">
            {/* Cloth type changer */}
            <div className="panel-section">
              <h3>Clothing Type</h3>
              <div className="clothing-options">
                <button
                  className={`clothing-btn ${clothingType === "tshirt" ? "active" : ""}`}
                >
                  T-Shirt
                </button>

              </div>
            </div>

            {/* Cloth colour changer */}
            <div className="panel-section">
              <h3>Color Selection</h3>
              <div className="color-palette">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>


            {/* Cloth image adding part*/}
            <div className="panel-section">
              <h3>Upload Custom Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                style={{ width: '90%' }}
                disabled={isUploadingImage}
              />
              {isUploadingImage && (
                <p className="upload-status">Uploading image...</p>
              )}
              {selectedDesign?.isCustomUpload && (
                <div className="custom-image-preview">
                  <img
                    src={selectedDesign.preview}
                    alt="Custom uploaded design"
                    className="preview-image"
                  />
                  <p className="preview-label">Custom Image Preview</p>
                </div>
              )}
              <p className="side-info">Will be placed on: <strong>{selectedSide}</strong></p>
            </div>

            {/* Cloth design controller*/}
            <div className="panel-section">
              <h3>Preset Designs</h3>
              <div className="design-grid">
                {presetDesigns.map((design) => (
                  <div
                    key={design.id}
                    className={`design-item ${selectedDesign?.id === design.id ? "selected" : ""}`}
                    onClick={() => handleDesignSelect(design)}
                  >
                    <img src={design.preview} alt={design.name} />
                    <p>{design.name}</p>
                    <span className="price">${design.price}</span>
                  </div>
                ))}
              </div>
              <p className="side-info">Will be placed on: <strong>{selectedSide}</strong></p>
            </div>


            <div className="panel-section">
              <h3>Pricing</h3>

              <div className="size-selector">
                <p><strong>Select Size:</strong></p>
                <div className="design-grid" style={{ marginBottom: '15px' }}>
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      className={`clothing-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quantity-selector" style={{ marginTop: '10px', marginBottom: '15px' }}>
                <p><strong>Quantity:</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    style={{ padding: '5px 10px' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    style={{ padding: '5px 10px' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="price-breakdown" style={{ marginTop: '10px' }}>
                <p>Base Price: ${basePrice}</p>
                <p>Designs: ${designPrice}</p>
                {selectedSize && <p>Size Extra: ${sizeExtraPrice}</p>}
                <p><strong>Quantity:</strong> {quantity}</p>
                <p className="total-price">
                  Total: ${totalPrice * quantity}
                </p>
              </div>

              {isEditMode && (
                <button
                  className="cancel-edit-button"
                  onClick={() => {
                    setEditingItemId(null);
                    clearForm();
                    window.location.href = '/orderManagement';
                  }}
                  style={{ marginBottom: '10px' }}
                >
                  Cancel Edit
                </button>
              )}

              {showCartButton ? (
                <div className="cart-navigation">
                  <button
                    className="view-cart-button"
                    onClick={() => window.location.href = '/orderManagement'}
                  >
                    View Cart
                  </button>
                  {!isEditMode && (
                    <button
                      className="new-customization-button"
                      onClick={clearForm}
                    >
                      Start New Customization
                    </button>
                  )}
                  {isEditMode && (
                    <button
                      className="new-customization-button"
                      onClick={() => {
                        setEditingItemId(null);
                        clearForm();
                        window.location.href = '/orderManagement';
                      }}
                    >
                      Start New Customization
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="order-btn"
                  onClick={saveClothCustomizer}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditMode ? 'Update & Save Changes' : 'Save & Add to Cart'}
                </button>
              )}

            </div>
          </div>


          <div className="canvas-container">
            {/* T-Shirt/CropTop Component */}

            <Canvas
              camera={{
                position: [5, 0, 5],
                fov: 45
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.3} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-5, 5, 5]} intensity={0.5} />

              <Bounds fit clip observe margin={1.2}>
                <TShirtModel
                  selectedColor={selectedColor}
                  chestDesignUrl={selectedDesign?.preview || null}
                  position={[0, 0, 0]}
                  scale={2}
                  designSize={designSize}
                />
              </Bounds>

              {/* <Bounds fit clip observe margin={1.2}>
                {clothingType === "tshirt" ? (
                  <TShirtModel
                    selectedColor={selectedColor}
                    chestDesignUrl={selectedDesign?.preview || null}
                    position={[0, 0, 0]}
                    scale={2}
                  />
                ) : (
                  <CropTopModel
                    selectedColor={selectedColor}
                    frontDesigns={frontDesigns}
                    backDesigns={backDesigns}
                    position={[0, 0, 0]}
                    scale={3}
                  />
                )}
              </Bounds> */}

              <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                minDistance={2}
                maxDistance={8}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
                autoRotate={false}
                autoRotateSpeed={-2.5}
                target={clothingType === "tshirt" ? [0, 2.5, 0] : [0, 3.5, 0]}
              />
            </Canvas>



          </div>

        </div>
      </div>
      <Footer />
      {/* Floating Cart Button */}
      {isAuthenticated() ? (
        <Link to="/orderManagement" className="floating-cart-btn">
          🛒 {cartItemsCount > 0 && <span className="cart-count">{cartItemsCount}</span>}
        </Link>
      ) : (
        <button 
          className="floating-cart-btn guest-cart-btn"
          onClick={() => {
            alert('Please login to view your cart');
            navigate('/login');
          }}
          title="Login to view cart"
        >
          🛒 <span className="guest-cart-text">Login</span>
        </button>
      )}

      {/* Login Prompt for Guest Users */}
      {showLoginPrompt && (
        <div className="login-prompt-overlay" onClick={handleOverlayClick}>
          <div className="login-prompt-content">
            <button 
              className="login-prompt-close"
              onClick={closeLoginPrompt}
              aria-label="Close prompt"
            >
              ×
            </button>
            <h3>Login Required</h3>
            <p>Please log in to save your customizations and add items to cart.</p>
            <div className="login-prompt-buttons">
              <button 
                className="login-prompt-btn primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              <button 
                className="login-prompt-btn secondary"
                onClick={closeLoginPrompt}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClothCustomizer;
