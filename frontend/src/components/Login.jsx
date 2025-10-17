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
  FaHome,
  FaArrowRight,
  FaCheckCircle,
  FaShoppingBag,
  FaChartLine,
  FaTruck,
  FaHeadset
} from 'react-icons/fa';
import { signupCustomer, signupSeller, loginCustomer, loginSeller } from '../services/api';
import './Login.css';

const Login = ({ setIsAuthenticated, setUserType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeForm, setActiveForm] = useState('customer-login');
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (location.state?.defaultTab === 'signup') {
      setActiveForm('customer-signup');
    }
    if (location.state?.userType === 'seller') {
      setActiveForm(location.state?.defaultTab === 'signup' ? 'seller-signup' : 'seller-login');
    }
  }, [location.state]);

  const handleSubmit = async (e, type, action) => {
    e.preventDefault();
    const key = `${type}-${action}`;
    setLoading({ [key]: true });
    setError({ [key]: '' });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      let response;

      if (action === 'Login') {
        response = type === 'Customer'
          ? await loginCustomer({ email: data.email, password: data.password })
          : await loginSeller({ email: data.email, password: data.password });
      } else {
        if (data.password !== data.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        response = type === 'Customer'
          ? await signupCustomer({ name: data.name, email: data.email, phone: data.phone, password: data.password })
          : await signupSeller({ businessName: data.businessName, contactPerson: data.contactPerson, email: data.email, phone: data.phone, password: data.password });
      }

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('userType', type.toLowerCase());

        if (type === 'Seller') {
          localStorage.setItem('sellerId', response.data.user._id);
        }

        setIsAuthenticated(true);
        setUserType(type.toLowerCase());

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

  const features = [
    { icon: FaShoppingBag, title: "Wide Selection", desc: "Browse thousands of products" },
    { icon: FaTruck, title: "Fast Delivery", desc: "Get your orders quickly" },
    { icon: FaChartLine, title: "Grow Business", desc: "Reach more customers" },
    { icon: FaHeadset, title: "24/7 Support", desc: "We're always here to help" }
  ];

  const renderForm = () => {
    switch(activeForm) {
      case 'customer-login':
        return (
          <div className="form-content" data-aos="fade-in">
            <div className="form-header">
              <FaUserCircle className="form-icon" />
              <h2>Welcome Back!</h2>
              <p>Login to your customer account</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'Customer', 'Login')}>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="Email Address" required />
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
              <div className="form-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot Password?</a>
              </div>
              {error['Customer-Login'] && (
                <div className="error-message">{error['Customer-Login']}</div>
              )}
              <button 
                type="submit" 
                className={`submit-btn ${loading['Customer-Login'] ? 'loading' : ''}`}
                disabled={loading['Customer-Login']}
              >
                {loading['Customer-Login'] ? 'Logging in...' : 'Login'}
              </button>
              <div className="form-footer">
                <p>Don't have an account? <button type="button" onClick={() => setActiveForm('customer-signup')} className="link-btn">Sign up</button></p>
                <div className="divider">or</div>
                <button type="button" onClick={() => setActiveForm('seller-login')} className="switch-btn">
                  <FaStore /> Login as Seller
                </button>
              </div>
            </form>
          </div>
        );

      case 'customer-signup':
        return (
          <div className="form-content" data-aos="fade-in">
            <div className="form-header">
              <FaUserPlus className="form-icon" />
              <h2>Create Account</h2>
              <p>Join our shopping community</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'Customer', 'Signup')}>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input type="text" name="name" placeholder="Full Name" required />
              </div>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="Email Address" required />
              </div>
              <div className="input-group">
                <FaPhone className="input-icon" />
                <input type="tel" name="phone" placeholder="Phone Number" required />
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
              </div>
              <div className="form-options">
                <label>
                  <input type="checkbox" required /> I agree to the <a href="#">Terms & Conditions</a>
                </label>
              </div>
              {error['Customer-Signup'] && (
                <div className="error-message">{error['Customer-Signup']}</div>
              )}
              <button 
                type="submit" 
                className={`submit-btn ${loading['Customer-Signup'] ? 'loading' : ''}`}
                disabled={loading['Customer-Signup']}
              >
                {loading['Customer-Signup'] ? 'Creating Account...' : 'Sign Up'}
              </button>
              <div className="form-footer">
                <p>Already have an account? <button type="button" onClick={() => setActiveForm('customer-login')} className="link-btn">Login</button></p>
                <div className="divider">or</div>
                <button type="button" onClick={() => setActiveForm('seller-signup')} className="switch-btn">
                  <FaStore /> Register as Seller
                </button>
              </div>
            </form>
          </div>
        );

      case 'seller-login':
        return (
          <div className="form-content seller-form" >
            <div className="form-header">
              <FaStore className="form-icon" />
              <h2>Seller Portal</h2>
              <p>Access your business dashboard</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'Seller', 'Login')}>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="Business Email" required />
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
              <div className="form-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot Password?</a>
              </div>
              {error['Seller-Login'] && (
                <div className="error-message">{error['Seller-Login']}</div>
              )}
              <button 
                type="submit" 
                className={`submit-btn seller-btn ${loading['Seller-Login'] ? 'loading' : ''}`}
                disabled={loading['Seller-Login']}
              >
                {loading['Seller-Login'] ? 'Logging in...' : 'Login as Seller'}
              </button>
              <div className="form-footer">
                <p>New seller? <button type="button" onClick={() => setActiveForm('seller-signup')} className="link-btn">Register here</button></p>
                <div className="divider">or</div>
                <button type="button" onClick={() => setActiveForm('customer-login')} className="switch-btn">
                  <FaUserCircle /> Login as Customer
                </button>
              </div>
            </form>
          </div>
        );

      case 'seller-signup':
        return (
          <div className="form-content seller-form" data-aos="fade-in">
            <div className="form-header">
              <FaStore className="form-icon" />
              <h2>Become a Seller</h2>
              <p>Start your business journey with us</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e, 'Seller', 'Signup')}>
              <div className="input-group">
                <FaBuilding className="input-icon" />
                <input type="text" name="businessName" placeholder="Business Name" required />
              </div>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input type="text" name="contactPerson" placeholder="Contact Person" required />
              </div>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="Business Email" required />
              </div>
              <div className="input-group">
                <FaPhone className="input-icon" />
                <input type="tel" name="phone" placeholder="Business Phone" required />
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
              </div>
              <div className="form-options">
                <label>
                  <input type="checkbox" required /> I agree to the <a href="#">Seller Agreement</a>
                </label>
              </div>
              {error['Seller-Signup'] && (
                <div className="error-message">{error['Seller-Signup']}</div>
              )}
              <button 
                type="submit" 
                className={`submit-btn seller-btn ${loading['Seller-Signup'] ? 'loading' : ''}`}
                disabled={loading['Seller-Signup']}
              >
                {loading['Seller-Signup'] ? 'Creating Account...' : 'Register as Seller'}
              </button>
              <div className="form-footer">
                <p>Already a seller? <button type="button" onClick={() => setActiveForm('seller-login')} className="link-btn">Login</button></p>
                <div className="divider">or</div>
                <button type="button" onClick={() => setActiveForm('customer-signup')} className="switch-btn">
                  <FaUserCircle /> Register as Customer
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-to-home" data-aos="fade-down">
        <FaHome /> Back to Home
      </Link>
      
      <div className="login-container">
        <div className="login-wrapper">
          {/* Left Side - Form */}
          <div className="form-side">
            {renderForm()}
          </div>
          
          {/* Right Side - Info */}
          <div className="info-side" data-aos="fade-left">
            <div className="info-content">
              <h1>Welcome to Our Platform</h1>
              <p className="tagline">Your one-stop solution for all shopping needs</p>
              
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item" data-aos="fade-up" data-aos-delay={index * 100}>
                    <feature.icon className="feature-icon" />
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="social-section">
                <p>Connect with us</p>
                <div className="social-icons">
                  <a href="#"><FaFacebook /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaGoogle /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
