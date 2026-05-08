import React from "react";
import { Link } from "react-router-dom";
import "./PermissionDenied.css";

const PermissionDenied = () => {
  return (
    <div className="permission-denied-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="permission-card">
              <div className="icon-wrapper">
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9L9 15" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9L15 15" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h1 className="error-code">403</h1>
              
              <h2 className="permission-title">
                Kirishga ruxsat yo'q!
              </h2>
              
              <p className="permission-text">
                Kechirasiz, ushbu sahifaga kirish uchun sizda yetarli huquqlar mavjud emas. 
                Tizim administratori bilan bog'laning yoki hisobingizni tekshiring.
              </p>
              
              <div className="d-flex justify-content-center gap-4">
                <Link className="btn-back-home" to="/dashboard">
                  Bosh sahifaga qaytish
                </Link>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-outline-light px-5 py-3" 
                  style={{ 
                    borderRadius: '15px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  Orqaga
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;
