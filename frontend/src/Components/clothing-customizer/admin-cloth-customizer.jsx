import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './ClothCustomizer.css';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/AuthGuard';

import print1 from './customizer_preset_designs/print 1.jpg'
import print2 from './customizer_preset_designs/print 2.jpg'
import print3 from './customizer_preset_designs/print 3.jpg'
import print4 from './customizer_preset_designs/print 4.jpg'
import print5 from './customizer_preset_designs/print 5.jpg'
import print6 from './customizer_preset_designs/print 6.jpg'

export default function AdminClothCustomizer() {
	const { getToken } = useAuth();
	const [prices, setPrices] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');

    // Use hardcoded images with database prices
    const processedPresetDesigns = prices?.presetDesigns?.map((design, index) => {
        const imageMap = [print1, print2, print3, print4, print5, print6];
        return {
            ...design,
            preview: imageMap[index] || print1
        };
    }) || [];

	// Fetch current prices
	const fetchPrices = async () => {
		try {
			console.log('Fetching prices...');
			const response = await axios.get('http://localhost:5001/customizer-prices');
			console.log('Fetch response:', response.data);
			if (response.data.status === "ok") {
				setPrices(response.data.data);
			}
		} catch (error) {
			console.error('Error fetching prices:', error);
			console.error('Error response:', error.response?.data);
			setMessage('Error fetching prices. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPrices();
	}, []);

	// Update prices
	const updatePrices = async () => {
		try {
			setSaving(true);
			const token = getToken();
			
			console.log('Updating prices:', prices);
			console.log('Token:', token);
			
			const response = await axios.put('http://localhost:5001/customizer-prices', prices, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			console.log('Update response:', response.data);

			if (response.data.status === "ok") {
				setMessage('Prices updated successfully!');
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage('Error updating prices. Please try again.');
			}
		} catch (error) {
			console.error('Error updating prices:', error);
			console.error('Error response:', error.response?.data);
			setMessage(`Error updating prices: ${error.response?.data?.message || error.message}`);
		} finally {
			setSaving(false);
		}
	};

	// Update base price
	const updateBasePrice = (value) => {
		setPrices(prev => ({
			...prev,
			basePrices: {
				...prev.basePrices,
				tshirt: parseFloat(value) || 0
			}
		}));
	};

	// Update size price
	const updateSizePrice = (size, value) => {
		setPrices(prev => ({
			...prev,
			sizePrices: {
				...prev.sizePrices,
				[size]: parseFloat(value) || 0
			}
		}));
	};

	// Update preset design price
	const updatePresetDesignPrice = (designId, value) => {
		setPrices(prev => ({
			...prev,
			presetDesigns: prev.presetDesigns.map(design =>
				design.id === designId
					? { ...design, price: parseFloat(value) || 0 }
					: design
			)
		}));
	};

	// Update preset design name
	const updatePresetDesignName = (designId, value) => {
		setPrices(prev => ({
			...prev,
			presetDesigns: prev.presetDesigns.map(design =>
				design.id === designId
					? { ...design, name: value }
					: design
			)
		}));
	};

	// Toggle preset design active status
	const togglePresetDesignActive = (designId) => {
		setPrices(prev => ({
			...prev,
			presetDesigns: prev.presetDesigns.map(design =>
				design.id === designId
					? { ...design, isActive: !design.isActive }
					: design
			)
		}));
	};

	// Update custom upload price
	const updateCustomUploadPrice = (value) => {
		setPrices(prev => ({
			...prev,
			customUploadPrice: parseFloat(value) || 0
		}));
	};

	if (loading) {
		return (
			<div className="arosh-admin-cloth-customizer-page">
				<NavBar />
				<main className="arosh-admin-cloth-customizer">
					<div className="arosh-loading">Loading prices...</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!prices) {
		return (
			<div className="arosh-admin-cloth-customizer-page">
				<NavBar />
				<main className="arosh-admin-cloth-customizer">
					<div className="arosh-error">Failed to load prices</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="arosh-admin-cloth-customizer-page">
			<NavBar />
			<main className="arosh-admin-cloth-customizer">
				<header className="arosh-admin-cloth-customizer__header">
					<h1>Admin Cloth Customizer</h1>
					<p>Manage customizer pricing and configurations.</p>
					{message && (
						<div className={`arosh-message ${message.includes('Error') ? 'error' : 'success'}`}>
							{message}
						</div>
					)}
				</header>

				<section className="arosh-admin-cloth-customizer__content">
					<div className="arosh-pricing-sections">
						{/* Base Prices */}
						<div className="arosh-pricing-section">
							<h3>Base Price</h3>
							<div className="arosh-price-inputs">
								<div className="arosh-price-input">
									<label>T-Shirt Base Price:</label>
									<input
										type="number"
										value={prices.basePrices.tshirt}
										onChange={(e) => updateBasePrice(e.target.value)}
										min="0"
										step="0.01"
										className="arosh-base-price-input"
									/>
								</div>
							</div>
						</div>

						{/* Size Prices */}
						<div className="arosh-pricing-section">
							<h3>Size Extra Prices</h3>
							<div className="arosh-size-price-inputs">
								{Object.entries(prices.sizePrices).map(([size, price]) => (
									<div key={size} className="arosh-size-price-input">
										<label>Size {size}:</label>
										<input
											type="number"
											value={price}
											onChange={(e) => updateSizePrice(size, e.target.value)}
											min="0"
											step="0.01"
										/>
									</div>
								))}
							</div>
						</div>

						{/* Preset Designs */}
						<div className="arosh-pricing-section">
							<h3>Preset Designs</h3>
							<div className="arosh-preset-designs">
								{processedPresetDesigns.map((design) => (
									<div key={design.id} className={`arosh-preset-design ${!design.isActive ? 'inactive' : ''}`}>
										<div className="arosh-design-info">
											<img src={design.preview} alt={design.name} className="arosh-design-preview" />
											<div className="arosh-design-details">
												<input
													type="text"
													value={design.name}
													onChange={(e) => updatePresetDesignName(design.id, e.target.value)}
													className="arosh-design-name-input"
												/>
												<div className="arosh-design-price-input">
													<label>Price:</label>
													<input
														type="number"
														value={design.price}
														onChange={(e) => updatePresetDesignPrice(design.id, e.target.value)}
														min="0"
														step="0.01"
													/>
												</div>
												<label className="arosh-active-toggle">
													<input
														type="checkbox"
														checked={design.isActive}
														onChange={() => togglePresetDesignActive(design.id)}
													/>
													Active
												</label>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Custom Upload Price */}
						<div className="arosh-pricing-section">
							<h3>Custom Upload Price</h3>
							<div className="arosh-price-input">
								<label>Custom Image Upload Price:</label>
								<input
									type="number"
									value={prices.customUploadPrice}
									onChange={(e) => updateCustomUploadPrice(e.target.value)}
									min="0"
									step="0.01"
								/>
							</div>
						</div>

						{/* Save Button */}
						<div className="arosh-save-section">
							<button
								className="arosh-save-prices-btn"
								onClick={updatePrices}
								disabled={saving}
							>
								{saving ? 'Saving...' : 'Save All Prices'}
							</button>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}