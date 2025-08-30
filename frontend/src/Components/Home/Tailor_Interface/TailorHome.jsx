import React, { useState } from 'react';
import NavBar from '../../NavBar/navBar';
import Footer from '../../Footer/Footer';
import { TShirtModel } from './components/TShirtModel';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';
import './TailorHome.css';
import OrderSummeryTailor from './OrderSummery_tailor';

function Tailor_Home() {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [clothingType, setClothingType] = useState("tshirt");
  const [selectedSide] = useState("front");
  const [activeDesignId, setActiveDesignId] = useState(null);
  const controlsRef = React.useRef();
  const [selectedSize, setSelectedSize] = useState(null);

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    setActiveDesignId(`${design.id}-${Date.now()}`);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="tailor-container">
      <NavBar />
      <div className="tailor-content">
        <div className="tailor-header">
          <h1>Hello!, Tailor</h1>
          <p>Streamline Your Tailoring Workflow</p>
        </div>

        <div className="tailor-main">
          <div className="tailor-right">
            <OrderSummeryTailor
              order={{
                imageUrl: selectedDesign?.preview || null,
                clothingType,
                size: selectedSize,
                color: selectedColor,
                quantity: 1,
                design: selectedDesign?.name || null
              }}
            />
          </div>

          {/* Left Column: Clothing Type + T-Shirt Preview */}
          <div className="tailor-left">
            <div className="tailor-canvas">
              <Canvas
                camera={{ position: [5, 0, 5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.1} />
                <pointLight position={[-5, 5, 5]} intensity={0.5} />

                <Bounds fit clip observe margin={1.2}>
                  <TShirtModel
                    selectedColor={selectedColor}
                    chestDesignUrl={selectedDesign?.preview || null}
                    position={[0, 0, 0]}
                    scale={2}
                  />
                </Bounds>

                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={8}
                  maxPolarAngle={Math.PI / 2}
                  minPolarAngle={Math.PI / 2}
                  target={[0, 2.5, 0]}
                />
              </Canvas>
            </div>
          </div>

          
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Tailor_Home;
