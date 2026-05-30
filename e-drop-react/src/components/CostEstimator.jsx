import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CostEstimator = () => {
    const [distance, setDistance] = useState('');
    const [weight, setWeight] = useState('');
    const [vehicleType, setVehicleType] = useState('Truck');
    const [estimation, setEstimation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced calculation for "Live Preview"
    useEffect(() => {
        const timer = setTimeout(() => {
            if (distance && weight) {
                calculateCost();
            } else {
                setEstimation(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [distance, weight, vehicleType]);

    const calculateCost = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/estimate/calculate', {
                distance: parseFloat(distance),
                weight: parseFloat(weight),
                vehicleType
            });
            if (res.data.success) {
                setEstimation(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Estimation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-card glass-morph !mt-0 !mb-12">
            <div className="section-header text-center">
                <h2 className="section-title">Cost <span className="highlight">Estimator</span></h2>
                <p className="section-subtitle">Enter details to get an instant shipping quote.</p>
            </div>

            <div className="form-grid mt-10">
                <div className="form-group">
                    <label>Distance (KM)</label>
                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="e.g., 25"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Weight (KG)</label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g., 5"
                        required
                    />
                </div>

                <div className="form-group-full">
                    <label className="text-center block mb-4">Vehicle Type</label>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {['Truck', 'Ship'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setVehicleType(v)}
                                className={`cta-button !py-3 !px-10 ${
                                    vehicleType === v ? '' : '!bg-white !text-orange-500 !border-2 !border-orange-500'
                                }`}
                                style={{ border: '2px solid #ff6b35' }}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {estimation && (
                <div className="tracking-id-box text-center mt-10 animate-visible">
                    <span>Estimated Shipping Cost:</span>
                    <strong>{estimation.totalCost.toLocaleString()} PKR</strong>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded-xl text-center font-medium mt-6">
                    {error}
                </div>
            )}

            {loading && !estimation && (
                <div className="flex justify-center py-6">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
            )}
        </div>
    );
};

export default CostEstimator;
