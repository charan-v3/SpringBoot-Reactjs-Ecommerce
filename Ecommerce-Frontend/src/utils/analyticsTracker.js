import axios from '../axios';

class AnalyticsTracker {
  constructor() {
    this.trackedPages = new Set();
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track page visit for authenticated users
   * @param {string} pageUrl - The current page URL
   * @param {string} referrer - The referrer URL
   */
  async trackPageVisit(pageUrl, referrer = '') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; // Don't track for unauthenticated users
      }

      // Avoid tracking the same page multiple times in the same session
      const pageKey = `${pageUrl}_${this.sessionId}`;
      if (this.trackedPages.has(pageKey)) {
        return;
      }

      const response = await axios.post('/analytics/track-visit', {
        pageUrl: pageUrl,
        referrer: referrer || document.referrer
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        this.trackedPages.add(pageKey);
        console.log('Page visit tracked:', pageUrl);
      }
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }

  /**
   * Track specific customer activities
   * @param {string} activityType - Type of activity (ADD_TO_CART, PRODUCT_SEARCH, etc.)
   * @param {string} additionalData - Additional data for the activity
   */
  async trackActivity(activityType, additionalData = '') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; // Don't track for unauthenticated users
      }

      const response = await axios.post('/analytics/track-activity', {
        activityType: activityType,
        additionalData: additionalData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        console.log('Activity tracked:', activityType, additionalData);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Track when user adds item to cart
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity added
   */
  trackAddToCart(productId, quantity = 1) {
    this.trackActivity('ADD_TO_CART', `product_${productId}_qty_${quantity}`);
  }

  /**
   * Track when user removes item from cart
   * @param {number} productId - Product ID
   */
  trackRemoveFromCart(productId) {
    this.trackActivity('REMOVE_FROM_CART', `product_${productId}`);
  }

  /**
   * Track product search
   * @param {string} searchTerm - Search term used
   */
  trackProductSearch(searchTerm) {
    this.trackActivity('PRODUCT_SEARCH', searchTerm);
  }

  /**
   * Track profile updates
   */
  trackProfileUpdate() {
    this.trackActivity('PROFILE_UPDATE');
  }

  /**
   * Track password changes
   */
  trackPasswordChange() {
    this.trackActivity('PASSWORD_CHANGE');
  }

  /**
   * Auto-track page visits using React Router
   * Call this in your main App component or routing setup
   */
  setupAutoTracking() {
    // Track initial page load
    this.trackPageVisit(window.location.pathname + window.location.search);

    // Track navigation changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackNavigation = () => {
      setTimeout(() => {
        this.trackPageVisit(window.location.pathname + window.location.search);
      }, 100);
    };

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackNavigation();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      trackNavigation();
    };

    window.addEventListener('popstate', trackNavigation);
  }
}

// Create a singleton instance
const analyticsTracker = new AnalyticsTracker();

export default analyticsTracker;
