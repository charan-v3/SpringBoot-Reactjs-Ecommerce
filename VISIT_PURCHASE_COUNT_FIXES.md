# Visit Count and Purchase Count Management Fixes

## Issues Identified and Fixed

### 1. Data Type Inconsistency
**Problem**: User model used `Long` for counts while Customer model used `int`
**Solution**: 
- Updated Customer model to use `Long` for both `visitCount` and `purchaseCount`
- Added null safety in getters/setters to return 0L if null

### 2. Missing Purchase Tracking
**Problem**: Purchase counts were only tracked in payment verification, not during order creation
**Solution**:
- Added purchase tracking in `OrderService.createOrder()` method
- Removed duplicate tracking from `PaymentController` to avoid double counting
- Purchase is now tracked when order is successfully created

### 3. Missing Visit Tracking
**Problem**: Visit tracking methods existed but weren't called from controllers
**Solution**:
- Added visit tracking to `ProductController.getProduct()` method
- Created `AnalyticsTrackingController` for general page visit tracking
- Added frontend analytics tracker utility

### 4. Session-Based Visit Tracking
**Problem**: Multiple visits in same session were being counted separately
**Solution**:
- Created `VisitTrackingService` to manage session-based visit tracking
- Only counts one visit per session per customer
- Automatic cleanup of old sessions every 30 minutes

### 5. Null Safety Issues
**Problem**: Existing users might have null visit/purchase counts
**Solution**:
- Added null checks in getter methods
- Created database migration script to fix existing null values
- Added `@Column(nullable = false)` constraints

## Files Modified

### Backend Changes

1. **Models**:
   - `User.java`: Added null safety to count getters/setters
   - `Customer.java`: Changed int to Long, added null safety

2. **Services**:
   - `OrderService.java`: Added purchase tracking on order creation
   - `CustomerService.java`: Integrated session-based visit tracking
   - `VisitTrackingService.java`: New service for session management

3. **Controllers**:
   - `ProductController.java`: Added visit tracking for product views
   - `PaymentController.java`: Removed duplicate purchase tracking
   - `AnalyticsTrackingController.java`: New controller for general tracking

4. **Configuration**:
   - `EcomProjApplication.java`: Enabled scheduling for cleanup tasks

5. **Database**:
   - `V2__fix_visit_purchase_counts.sql`: Migration to fix null values

### Frontend Changes

1. **Utilities**:
   - `analyticsTracker.js`: New utility for tracking user activities

2. **Components**:
   - `App.jsx`: Added PageTracker component and auto-tracking setup
   - `Cart.jsx`: Added tracking for remove from cart actions
   - `Context.jsx`: Added tracking for add to cart actions

## Key Features Added

### 1. Automatic Visit Tracking
- Tracks page visits for authenticated customers
- Prevents duplicate counting within same session
- Tracks product views, home page visits, etc.

### 2. Comprehensive Activity Tracking
- Add to cart / Remove from cart
- Product searches
- Profile updates
- Order placements

### 3. Session Management
- Prevents duplicate visit counting
- Automatic cleanup of old sessions
- Memory-efficient tracking

### 4. Null Safety
- All count fields now handle null values gracefully
- Database migration ensures existing data is clean
- Default values prevent null pointer exceptions

## API Endpoints Added

### Analytics Tracking
- `POST /api/analytics/track-visit`: Track page visits
- `POST /api/analytics/track-activity`: Track specific activities

## Testing

Created comprehensive test suite:
- `VisitPurchaseTrackingTest.java`: Tests for all tracking functionality
- Tests session-based visit tracking
- Tests null safety for count fields
- Tests purchase tracking integration

## Usage Examples

### Frontend Tracking
```javascript
// Track page visit
analyticsTracker.trackPageVisit('/product/123');

// Track activities
analyticsTracker.trackAddToCart(productId, quantity);
analyticsTracker.trackRemoveFromCart(productId);
analyticsTracker.trackProductSearch('laptop');
```

### Backend Tracking
```java
// Track customer visit
customerService.trackCustomerVisit(customerId, sessionId, ipAddress, userAgent, pageUrl, referrer);

// Track customer purchase
customerService.trackCustomerPurchase(customerId, orderNumber, sessionId);
```

## Benefits

1. **Accurate Analytics**: Proper visit and purchase counting
2. **Performance**: Session-based tracking prevents excessive database writes
3. **Reliability**: Null safety prevents application crashes
4. **Comprehensive**: Tracks all major user activities
5. **Maintainable**: Clean separation of concerns with dedicated services

## Migration Notes

1. Run the database migration script to fix existing null values
2. The application will automatically start tracking visits and purchases
3. Old sessions will be cleaned up automatically
4. No manual intervention required for existing users
