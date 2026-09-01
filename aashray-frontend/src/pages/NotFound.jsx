// src/pages/NotFound.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import aashrayLogo from '../assets/Aasray.svg';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4 position-relative text-white" style={{ zIndex: 1 }}>

            <div className="cyber-card p-5 max-w-lg mx-auto border border-info border-opacity-50 shadow-lg" style={{ maxWidth: '520px', width: '100%' }}>

                {/* Logo */}
                <div className="mb-3">
                    <img
                        src={aashrayLogo}
                        alt="Aashray Logo"
                        style={{ width: '65px', height: '65px', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))' }}
                    />
                </div>

                {/* 404 Neon Code */}
                <h1 className="display-1 fw-bold text-cyan-glow font-monospace mb-0" style={{ letterSpacing: '4px' }}>
                    404
                </h1>
                <h4 className="fw-bold text-white mb-2">Sanctuary Coordinates Not Found</h4>
                <p className="text-subtext small mb-4">
                    The coordinate or digital path you are trying to reach does not exist within the Aashray cryptographic network or has expired.
                </p>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-action px-4 py-2"
                    >
                        <i className="fa-solid fa-arrow-left me-2"></i>Go Back
                    </button>
                    <Link to="/dashboard" className="btn btn-lightning px-4 py-2">
                        <i className="fa-solid fa-compass me-2"></i>Discover Sanctuaries
                    </Link>
                </div>

            </div>

            {/* Footer */}
            <footer className="position-absolute bottom-0 text-center py-3 w-100 text-subtext small">
                &copy; {new Date().getFullYear()} Aashray Platforms Inc. Secure Navigation.
            </footer>

        </div>
    );
};

export default NotFound;