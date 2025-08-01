import React from 'react';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-section">
                <h5 className="footer-title">
                  <i className="bi bi-lightning-charge-fill me-2"></i>
                  Ekart
                </h5>
                <p className="footer-description">
                  Your premier destination for quality products and exceptional shopping experience. 
                  Discover amazing deals and fast delivery.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-subtitle">Quick Links</h6>
                <ul className="footer-links">
                  <li><a href="/">Home</a></li>
                  <li><a href="/products">Products</a></li>
                  <li><a href="/categories">Categories</a></li>
                  <li><a href="/about">About Us</a></li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-subtitle">Customer Service</h6>
                <ul className="footer-links">
                  <li><a href="/contact">Contact Us</a></li>
                  <li><a href="/support">Support</a></li>
                  <li><a href="/shipping">Shipping Info</a></li>
                  <li><a href="/returns">Returns</a></li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-subtitle">Newsletter</h6>
                <p className="footer-newsletter-text">
                  Subscribe to get updates on new products and exclusive offers.
                </p>
                <div className="newsletter-form">
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control newsletter-input" 
                      placeholder="Enter your email"
                    />
                    <button className="btn btn-primary newsletter-btn" type="button">
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="footer-divider" />
          
          <div className="footer-bottom">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="footer-copyright">
                  © 2024 Ekart. All rights reserved.
                </p>
              </div>
              <div className="col-md-6">
                <div className="footer-bottom-links">
                  <a href="/privacy">Privacy Policy</a>
                  <a href="/terms">Terms of Service</a>
                  <a href="/cookies">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
