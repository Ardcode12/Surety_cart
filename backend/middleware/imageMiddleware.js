const { getFullImageUrl } = require('../utils/imageUtils');

const normalizeImageUrls = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => normalizeImageUrls(item));
  }
  
  if (data && typeof data === 'object') {
    if (data.image) {
      data.imageUrl = data.image; // Keep original
      data.displayImage = getFullImageUrl(data.image); // Add processed URL
    }
    
    if (data.product && data.product.image) {
      data.product.imageUrl = data.product.image;
      data.product.displayImage = getFullImageUrl(data.product.image);
    }
  }
  
  return data;
};

module.exports = { normalizeImageUrls };
