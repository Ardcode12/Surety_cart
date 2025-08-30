import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  FaUserCircle, 
  FaStore, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaPhone, 
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaUserPlus,
  FaHome
} from 'react-icons/fa';
import { signupCustomer, signupSeller, loginCustomer, loginSeller } from '../services/api';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(
    location.state?.defaultTab === 'signup' ? false : true
  );
  
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [isLogin]);

  useEffect(() => {
    if (location.state?.userType === 'seller' && !isLogin) {
      setTimeout(() => {
        const sellerSection = document.querySelector('.seller-section');
        if (sellerSection) {
          sellerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [location.state, isLogin]);

  // In frontend/src/components/Login.jsx

  const handleSubmit = async (e, type, action) => {
    e.preventDefault();
    const key = `${type}-${action}`;
    setLoading({ [key]: true });
    setError({ [key]: '' });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        let response;

        // Call the correct API function based on the action
        if (action === 'Login') {
            response = type === 'Customer'
                ? await loginCustomer({ email: data.email, password: data.password })
                : await loginSeller({ email: data.email, password: data.password });
        } else { // action === 'Signup'
            if (data.password !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            response = type === 'Customer'
                ? await signupCustomer({ name: data.name, email: data.email, phone: data.phone, password: data.password })
                : await signupSeller({ businessName: data.businessName, contactPerson: data.contactPerson, email: data.email, phone: data.phone, password: data.password });
        }

        // --- SUCCESS HANDLER ---
        if (response.data.token && response.data.user) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userInfo', JSON.stringify(response.data.user));
            localStorage.setItem('userType', type.toLowerCase());

            // --- NEW: Store sellerId for seller users ---
           if (type === 'Seller') {
    localStorage.setItem('sellerId', response.data.user._id);
    console.log("Stored sellerId:", response.data.user._id);
}


            setIsAuthenticated(true);
            setUserType(type.toLowerCase());

            // Navigate based on user type
            if (type === 'Seller') {
                navigate('/seller-dashboard');
            } else {
                navigate('/');
            }
        } else {
            throw new Error('An unexpected error occurred. Please try again.');
        }

    } catch (err) {
        console.error(`${type} ${action} Error:`, err);
        setError({
            [key]: err.response?.data?.error || err.message || 'An error occurred'
        });
    } finally {
        setLoading({ [key]: false });
    }
};

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const LoginForm = () => (
    <div className="form-container active">
      <div className="form-wrapper">
        {/* Customer Login */}
        <div className="form-section customer-section" data-aos="fade-right" data-aos-delay="200">
          <div className="section-header">
            <FaUserCircle className="section-icon" />
            <h2>Customer Login</h2>
          </div>
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'Customer', 'Login')}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                required 
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['customer-login'] ? 'text' : 'password'} 
                name="password"
                placeholder="Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('customer-login')}
              >
                {showPassword['customer-login'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            {error['Customer-Login'] && (
              <div className="error-message" style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                {error['Customer-Login']}
              </div>
            )}
            <button 
              type="submit" 
              className={`submit-btn customer-btn ${loading['Customer-Login'] ? 'loading' : ''}`}
              disabled={loading['Customer-Login']}
            >
              {loading['Customer-Login'] ? '' : 'Login as Customer'}
            </button>
            <div className="social-login">
              <p>Or login with</p>
              <div className="social-icons">
                <a href="#"><FaGoogle /></a>
                <a href="#"><FaFacebook /></a>
                <a href="#"><FaTwitter /></a>
              </div>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="divider" data-aos="zoom-in" data-aos-delay="400">
          <div className="divider-line"></div>
          <span>OR</span>
          <div className="divider-line"></div>
        </div>

        {/* Seller Login */}
        <div className="form-section seller-section" data-aos="fade-left" data-aos-delay="200">
          <div className="section-header">
            <FaStore className="section-icon" />
            <h2>Seller Login</h2>
          </div>
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'Seller', 'Login')}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Business Email" 
                required 
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['seller-login'] ? 'text' : 'password'} 
                name="password"
                placeholder="Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('seller-login')}
              >
                {showPassword['seller-login'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            {error['Seller-Login'] && (
              <div className="error-message" style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                {error['Seller-Login']}
              </div>
            )}
            <button 
              type="submit" 
              className={`submit-btn seller-btn ${loading['Seller-Login'] ? 'loading' : ''}`}
              disabled={loading['Seller-Login']}
            >
              {loading['Seller-Login'] ? '' : 'Login as Seller'}
            </button>
            <div className="seller-extra">
              <p>New seller? <a href="#">Apply here</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const SignupForm = () => (
    <div className="form-container active">
      <div className="form-wrapper">
        {/* Customer Signup */}
        <div className="form-section customer-section" data-aos="fade-right" data-aos-delay="200">
          <div className="section-header">
            <FaUserPlus className="section-icon" />
            <h2>Customer Sign Up</h2>
          </div>
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'Customer', 'Signup')}>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                name="name"
                placeholder="Full Name" 
                required 
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                required 
              />
            </div>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone Number" 
                required 
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['customer-signup'] ? 'text' : 'password'} 
                name="password"
                placeholder="Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('customer-signup')}
              >
                {showPassword['customer-signup'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['customer-confirm'] ? 'text' : 'password'} 
                name="confirmPassword"
                placeholder="Confirm Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('customer-confirm')}
              >
                {showPassword['customer-confirm'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="terms">
              <label>
                <input type="checkbox" required /> I agree to the <a href="#">Terms & Conditions</a>
              </label>
            </div>
            {error['Customer-Signup'] && (
              <div className="error-message" style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                {error['Customer-Signup']}
              </div>
            )}
            <button 
              type="submit" 
              className={`submit-btn customer-btn ${loading['Customer-Signup'] ? 'loading' : ''}`}
              disabled={loading['Customer-Signup']}
            >
              {loading['Customer-Signup'] ? '' : 'Sign Up as Customer'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="divider" data-aos="zoom-in" data-aos-delay="400">
          <div className="divider-line"></div>
          <span>OR</span>
          <div className="divider-line"></div>
        </div>

        {/* Seller Signup */}
        <div className="form-section seller-section" data-aos="fade-left" data-aos-delay="200">
          <div className="section-header">
            <FaStore className="section-icon" />
            <h2>Seller Sign Up</h2>
          </div>
          <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'Seller', 'Signup')}>
            <div className="input-group">
              <FaBuilding className="input-icon" />
              <input 
                type="text" 
                name="businessName"
                placeholder="Business Name" 
                required 
              />
            </div>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                name="contactPerson"
                placeholder="Contact Person" 
                required 
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Business Email" 
                required 
              />
            </div>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input 
                type="tel" 
                name="phone"
                placeholder="Business Phone" 
                required 
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['seller-signup'] ? 'text' : 'password'} 
                name="password"
                placeholder="Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('seller-signup')}
              >
                {showPassword['seller-signup'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type={showPassword['seller-confirm'] ? 'text' : 'password'} 
                name="confirmPassword"
                placeholder="Confirm Password" 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('seller-confirm')}
              >
                {showPassword['seller-confirm'] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="terms">
              <label>
                <input type="checkbox" required /> I agree to the <a href="#">Seller Agreement</a>
              </label>
            </div>
            {error['Seller-Signup'] && (
              <div className="error-message" style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                {error['Seller-Signup']}
              </div>
            )}
            <button 
              type="submit" 
              className={`submit-btn seller-btn ${loading['Seller-Signup'] ? 'loading' : ''}`}
              disabled={loading['Seller-Signup']}
            >
              {loading['Seller-Signup'] ? '' : 'Sign Up as Seller'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home" data-aos="fade-down">
        <FaHome /> Back to Home
      </Link>
      
      <div className="container">
        {/* Toggle Button */}
        <div className="form-toggle" data-aos="fade-down">
          <button 
            className={`toggle-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default Login;
