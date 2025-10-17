import React, { useState } from 'react';
import axios from 'axios';
import { getFullImageUrl } from '../services/api';

const CloudinaryTest = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [testResults, setTestResults] = useState([]);

  const testCloudinaryConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/test-cloudinary');
      setTestResults(prev => [...prev, {
        test: 'Connection Test',
        result: 'SUCCESS',
        data: response.data
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Connection Test',
        result: 'FAILED',
        error: error.message
      }]);
    }
  };

  const testImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', 'Test Product');
    formData.append('price', '100');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/products',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUploadResult(response.data);
      setTestResults(prev => [...prev, {
        test: 'Upload Test',
        result: 'SUCCESS',
        imageUrl: response.data.image
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Upload Test',
        result: 'FAILED',
        error: error.response?.data?.message || error.message
      }]);
    }
  };

  const testImageUrls = [
    '/uploads/test.jpg',
    'https://res.cloudinary.com/dunaikpfl/image/upload/v1234/test.jpg',
    'invalid-url'
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Cloudinary Debug Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testCloudinaryConnection}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test Cloudinary Connection
        </button>
        
        <input 
          type="file" 
          onChange={testImageUpload}
          accept="image/*"
          style={{ marginLeft: '10px' }}
        />
        <label>Upload Test Image</label>
      </div>

      {uploadResult && (
        <div style={{ 
          background: '#e8f5e9', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>Upload Result:</h3>
          <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
          {uploadResult.image && (
            <div>
              <p>Image URL: <code>{uploadResult.image}</code></p>
              <img 
                src={getFullImageUrl(uploadResult.image)} 
                alt="Uploaded" 
                style={{ maxWidth: '300px', marginTop: '10px' }}
                onLoad={() => console.log('Image loaded successfully!')}
                onError={(e) => console.error('Image failed to load:', e.target.src)}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>URL Processing Tests:</h3>
        {testImageUrls.map((url, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <code>Input: {url}</code><br/>
            <code>Output: {getFullImageUrl(url)}</code>
          </div>
        ))}
      </div>

      <div>
        <h3>Test Results:</h3>
        {testResults.map((result, index) => (
          <div 
            key={index}
            style={{
              background: result.result === 'SUCCESS' ? '#e8f5e9' : '#ffebee',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            <strong>{result.test}:</strong> {result.result}
            {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
            {result.error && <p style={{ color: 'red' }}>{result.error}</p>}
            {result.imageUrl && <p>Image URL: <code>{result.imageUrl}</code></p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudinaryTest;
