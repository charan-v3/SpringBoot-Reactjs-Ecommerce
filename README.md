
# 🛍️ Full Stack E-commerce Web Application

A comprehensive **E-commerce application** built with **Spring Boot** (Java) for the backend and **ReactJS with Vite** for the frontend. This application features complete user authentication, role-based access control, order management, payment processing, analytics dashboard, and admin verification system.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with role-based access control
- **Customer registration and login** with profile management
- **Admin verification system** with approval workflow
- **Protected routes** and secure API endpoints

### 🛒 E-commerce Core
- **Product catalog** with image upload and management
- **Shopping cart** with real-time updates
- **Order management** with tracking system
- **Payment processing** (UPI/Razorpay integration)
- **Guest checkout** support

### 📊 Analytics & Management
- **Admin dashboard** with real-time analytics
- **Customer analytics** and behavior tracking
- **Order analytics** with revenue insights
- **Product management** with CRUD operations

### 🔒 Security Features
- **Cross-customer order isolation**
- **Secure file upload** with validation
- **CORS configuration** for frontend integration
- **Password encryption** with BCrypt

---

## 📁 Project Structure

```
SpringBoot-Reactjs-Ecommerce/
├── Ecommerce-Backend/           # Spring Boot REST API backend
├── Ecommerce-Frontend/          # React + Vite frontend application
├── ORDER_MANAGEMENT_WORKFLOW.md # Order management documentation
├── ORDER_SECURITY_IMPROVEMENTS.md # Security implementation details
├── test_admin_verification.py   # Python test scripts
└── verify_database_schema.py    # Database verification scripts
```

---

## 🧩 Backend - Spring Boot

### 🔧 Technologies Used

* **Java 17+**
* **Spring Boot 3.x** with Spring Security
* **Spring Data JPA** with Hibernate
* **MySQL Database** with connection pooling
* **JWT Authentication** with role-based access
* **Maven** for dependency management
* **BCrypt** for password encryption
* **File Upload** with validation
* **CORS** configuration

### 📂 Backend Directory Structure

```
Ecommerce-Backend/
├── src/main/java/com/cart/ecom_proj/
│   ├── controller/              # REST API Controllers
│   │   ├── AuthController.java          # Authentication endpoints
│   │   ├── ProductController.java       # Product CRUD operations
│   │   ├── CartController.java          # Shopping cart management
│   │   ├── OrderController.java         # Order management
│   │   ├── PaymentController.java       # Payment processing
│   │   ├── AnalyticsController.java     # Analytics & reporting
│   │   ├── UserProfileController.java   # User profile management
│   │   └── AdminVerificationController.java # Admin verification
│   ├── model/                   # JPA Entity Classes
│   │   ├── User.java                    # Base user entity
│   │   ├── Customer.java               # Customer entity
│   │   ├── Admin.java                  # Admin entity
│   │   ├── Product.java                # Product entity
│   │   ├── Order.java                  # Order entity
│   │   └── CartItem.java               # Cart item entity
│   ├── repo/                    # Spring Data JPA Repositories
│   │   ├── UserRepo.java
│   │   ├── CustomerRepo.java
│   │   ├── AdminRepo.java
│   │   ├── ProductRepo.java
│   │   ├── OrderRepo.java
│   │   └── CartItemRepo.java
│   ├── service/                 # Business Logic Services
│   │   ├── AuthService.java
│   │   ├── ProductService.java
│   │   ├── CartService.java
│   │   ├── OrderService.java
│   │   ├── PaymentService.java
│   │   ├── CustomerService.java
│   │   └── AdminService.java
│   ├── config/                  # Configuration Classes
│   │   ├── SecurityConfig.java         # Spring Security config
│   │   └── CorsConfig.java             # CORS configuration
│   ├── dto/                     # Data Transfer Objects
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── SignupRequest.java
│   │   ├── OrderResponse.java
│   │   └── ProductListResponse.java
│   └── util/                    # Utility Classes
│       ├── JwtUtil.java                # JWT token utilities
│       └── FileStorageService.java     # File upload service
├── src/main/resources/
│   ├── application.properties          # Database & app config
│   └── data1.sql                      # Initial data seeding
├── src/test/java/                      # Test Classes
│   ├── EcomProjApplicationTests.java
│   └── OrderSecurityTest.java         # Security tests
├── uploads/                            # File upload directory
└── pom.xml                            # Maven dependencies
```

### ⚙️ Setup Instructions

1. **Prerequisites:**
   * Java 17 or higher
   * MySQL 8.0 or higher
   * Maven 3.6 or higher

2. **Database Setup:**
   * Create a MySQL database: `ecomdb`
   * Update `application.properties`:

     ```properties
     # Database Configuration
     spring.datasource.url=jdbc:mysql://localhost:3306/ecomdb
     spring.datasource.username=root
     spring.datasource.password=yourpassword
     spring.jpa.hibernate.ddl-auto=update
     spring.jpa.show-sql=true

     # JWT Configuration
     jwt.secret=your-secret-key
     jwt.expiration=86400000

     # File Upload Configuration
     spring.servlet.multipart.max-file-size=10MB
     spring.servlet.multipart.max-request-size=10MB

     # Payment Configuration (Optional)
     razorpay.key.id=your-razorpay-key
     razorpay.key.secret=your-razorpay-secret
     ```

3. **Run the Application:**

   ```bash
   cd Ecommerce-Backend
   mvn clean install
   mvn spring-boot:run
   ```

4. **Data Initialization:**
   * On first run, `data1.sql` automatically seeds the database with sample products
   * Default admin account may be created (check application logs)

5. **Verify Setup:**
   * Backend runs on: `http://localhost:8080`
   * Test API health: `GET http://localhost:8080/api/products`

### 📡 REST API Endpoints

#### 🔐 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/customer/signup` | Customer registration | No |
| POST | `/api/auth/customer/login` | Customer login | No |
| POST | `/api/auth/admin/signup` | Admin registration (requires verification) | No |
| POST | `/api/auth/admin/login` | Admin login | No |
| GET | `/api/auth/validate` | Validate JWT token | Yes |

#### 🛍️ Product Endpoints (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (optimized) | No |
| GET | `/api/products/fast` | Get all products (fast endpoint) | No |
| GET | `/api/product/{id}` | Get product by ID | No |
| GET | `/api/product/{id}/image` | Get product image | No |
| GET | `/api/products/search?keyword={keyword}` | Search products | No |
| POST | `/api/product` | Add new product (with image) | Admin |
| PUT | `/api/product/{id}` | Update product (with image) | Admin |
| DELETE | `/api/product/{id}` | Delete product | Admin |

#### 🛒 Cart Endpoints (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/cart/add` | Add item to cart | Customer |
| GET | `/api/cart` | Get cart items | Customer |
| PUT | `/api/cart/update/{itemId}` | Update cart item quantity | Customer |
| DELETE | `/api/cart/remove/{itemId}` | Remove item from cart | Customer |
| DELETE | `/api/cart/clear` | Clear entire cart | Customer |
| GET | `/api/cart/total` | Get cart total | Customer |

#### 📦 Order Endpoints (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get customer's orders | Customer |
| GET | `/api/orders/{orderId}` | Get specific order | Customer (own orders) |
| GET | `/api/orders/track/{orderNumber}` | Track order by number | No |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| GET | `/api/orders/admin/order/{orderId}` | Get any order by ID | Admin |
| PUT | `/api/orders/admin/{orderId}/status` | Update order status | Admin |

#### 💳 Payment Endpoints (`/api/payment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/create-order` | Create Razorpay order | Customer |
| POST | `/api/payment/verify` | Verify payment | Customer |
| POST | `/api/payment/upi-payment` | Process UPI payment | Customer/Guest |
| GET | `/api/payment/upi-qr?amount={amount}&orderNumber={orderNumber}` | Generate UPI QR | No |
| GET | `/api/payment/settings` | Get payment settings | No |

#### 📊 Analytics Endpoints (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/admin/dashboard` | Get admin dashboard data | Admin |
| GET | `/api/analytics/customer/{customerId}` | Get customer analytics | Admin/Customer (own) |
| GET | `/api/analytics/customers/filter?filter={filter}` | Get filtered customers | Admin |

#### 👤 Profile Endpoints (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/customer` | Get customer profile | Customer |
| GET | `/api/profile/admin` | Get admin profile | Admin |
| PUT | `/api/profile/customer` | Update customer profile | Customer |
| PUT | `/api/profile/admin` | Update admin profile | Admin |

#### 🔧 Admin Verification Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/unverified` | Get unverified admins | Admin |
| POST | `/api/admin/verify/{adminId}` | Verify admin account | Admin |
| POST | `/api/admin/reject/{adminId}` | Reject admin request | Admin |
| GET | `/api/admin/verified` | Get verified admins | Admin |

---

## 💻 Frontend - React + Vite

### 🔧 Technologies Used

* **React 18.2.0** - Modern React with hooks
* **Vite 5.2.8** - Fast build tool and dev server
* **React Router DOM 6.22.3** - Client-side routing
* **Axios 1.6.8** - HTTP client for API calls
* **Bootstrap 5.3.3** - UI framework with responsive design
* **React Bootstrap 2.10.2** - Bootstrap components for React
* **Bootstrap Icons 1.11.3** - Icon library
* **Context API** - State management
* **JWT Authentication** - Secure user sessions

### 📂 Frontend Directory Structure

```
Ecommerce-Frontend/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React Components
│   │   ├── Home.jsx                     # Product listing page
│   │   ├── Navbar.jsx                   # Navigation component
│   │   ├── Footer.jsx                   # Footer component
│   │   ├── Product.jsx                  # Product details page
│   │   ├── Cart.jsx                     # Shopping cart
│   │   ├── Login.jsx                    # Login form (customer/admin)
│   │   ├── Signup.jsx                   # Registration form
│   │   ├── AddProduct.jsx               # Add product (admin)
│   │   ├── UpdateProduct.jsx            # Update product (admin)
│   │   ├── AdminDashboard.jsx           # Admin dashboard
│   │   ├── UserProfile.jsx              # User profile management
│   │   ├── OrderHistory.jsx             # Customer order history
│   │   ├── OrderTracking.jsx            # Order tracking
│   │   ├── OrderSuccess.jsx             # Order confirmation
│   │   ├── OrderManagement.jsx          # Admin order management
│   │   ├── OrderDetail.jsx              # Order details view
│   │   ├── AdminVerificationDashboard.jsx # Admin verification
│   │   ├── CustomerAnalytics.jsx        # Customer analytics
│   │   ├── ProtectedRoute.jsx           # Route protection
│   │   ├── RoleRedirect.jsx             # Role-based redirects
│   │   ├── ErrorBoundary.jsx            # Error handling
│   │   └── ScrollToTop.jsx              # Scroll utility
│   ├── Context/                     # React Context
│   │   ├── Context.jsx                  # App state context
│   │   └── AuthContext.jsx              # Authentication context
│   ├── App.jsx                      # Main app component
│   ├── App.css                      # Global styles
│   └── main.jsx                     # Entry point
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
└── index.html                       # HTML template
```

### ▶️ Getting Started

1. **Prerequisites:**
   * Node.js 16+ and npm
   * Backend server running on `http://localhost:8080`

2. **Install dependencies:**

   ```bash
   cd Ecommerce-Frontend
   npm install
   ```

3. **Environment Configuration:**
   * Update API base URL in components if needed
   * Default backend URL: `http://localhost:8080`

4. **Run the application:**

   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

5. **Build for production:**

   ```bash
   npm run build
   npm run preview
   ```

### 🧩 Frontend Features

#### 🔐 Authentication System
* **Dual login system** - Customer and Admin portals
* **JWT token management** with automatic refresh
* **Role-based route protection**
* **Persistent login state** with localStorage

#### 🛍️ E-commerce Features
* **Product catalog** with search and filtering
* **Shopping cart** with real-time updates
* **Guest checkout** and authenticated checkout
* **Order tracking** with status updates
* **Payment integration** (UPI/Razorpay)

#### 👨‍💼 Admin Features
* **Product management** - Add, edit, delete products
* **Order management** - View and update order status
* **Customer analytics** - User behavior insights
* **Admin verification** - Approve new admin accounts
* **Real-time dashboard** with key metrics

#### 📱 User Experience
* **Fully responsive design** - Mobile-first approach
* **Bootstrap UI components** - Professional styling
* **Error boundaries** - Graceful error handling
* **Loading states** - Better user feedback
* **Toast notifications** - Action confirmations

### 🛣️ Frontend Routing

| Route | Component | Access Level | Description |
|-------|-----------|--------------|-------------|
| `/` | Home | Public | Product catalog homepage |
| `/product/:id` | Product | Public | Product details page |
| `/cart` | Cart | Public | Shopping cart |
| `/customer/login` | Login | Public | Customer login |
| `/admin/login` | Login | Public | Admin login |
| `/customer/signup` | Signup | Public | Customer registration |
| `/admin/signup` | Signup | Public | Admin registration |
| `/orders` | OrderHistory | Customer | Customer order history |
| `/track-order` | OrderTracking | Public | Order tracking |
| `/order-success` | OrderSuccess | Public | Order confirmation |
| `/profile` | UserProfile | Authenticated | User profile |
| `/add_product` | AddProduct | Admin | Add new product |
| `/product/update/:id` | UpdateProduct | Admin | Edit product |
| `/admin/dashboard` | AdminDashboard | Admin | Admin dashboard |
| `/admin/verification` | AdminVerificationDashboard | Admin | Admin verification |
| `/admin/orders` | OrderManagement | Admin | Order management |
| `/admin/orders/:orderId` | OrderDetail | Admin | Order details |
| `/analytics/customer/:customerId` | CustomerAnalytics | Admin | Customer analytics |

---

## 🔒 Security Implementation

### 🛡️ Backend Security

#### Authentication & Authorization
* **JWT tokens** with configurable expiration
* **Role-based access control** (CUSTOMER, ADMIN)
* **Password encryption** using BCrypt
* **Cross-origin resource sharing** (CORS) configuration

#### API Security
* **Protected endpoints** with role validation
* **Request validation** and sanitization
* **File upload security** with type and size limits
* **SQL injection prevention** with JPA/Hibernate

#### Data Security
* **Customer order isolation** - Users can only access their own orders
* **Admin verification system** - New admins require approval
* **Sensitive data filtering** - Passwords excluded from responses
* **Secure file storage** with validation

### 🔐 Frontend Security

#### Route Protection
* **ProtectedRoute component** for authentication checks
* **Role-based redirects** for unauthorized access
* **Token validation** on protected routes
* **Automatic logout** on token expiration

#### Data Handling
* **Secure token storage** in localStorage
* **API request interceptors** for authentication
* **Input validation** on forms
* **XSS prevention** with React's built-in protection

---

## 🧪 Testing

### Backend Tests
* **Unit tests** with JUnit 5
* **Integration tests** for security
* **Order security tests** - Cross-customer access prevention
* **Repository tests** - Data isolation verification

### Test Coverage
* **Authentication flows** - Login, signup, token validation
* **Order management** - Customer isolation, admin access
* **Analytics** - Data aggregation and filtering
* **File upload** - Security and validation

### Running Tests

```bash
cd Ecommerce-Backend
mvn test
```

### Python Test Scripts
* `test_admin_verification.py` - Admin verification workflow testing
* `verify_database_schema.py` - Database schema validation

---

## 🚀 Deployment

### Backend Deployment

1. **Production Configuration:**
   ```properties
   # application-prod.properties
   spring.profiles.active=prod
   spring.datasource.url=jdbc:mysql://your-db-host:3306/ecomdb
   spring.jpa.hibernate.ddl-auto=validate
   jwt.secret=your-production-secret-key
   ```

2. **Build and Deploy:**
   ```bash
   mvn clean package -Pprod
   java -jar target/ecom-proj-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment

1. **Build for Production:**
   ```bash
   cd Ecommerce-Frontend
   npm run build
   ```

2. **Deploy to Static Hosting:**
   * Upload `dist/` folder to your hosting provider
   * Configure environment variables for API endpoints
   * Set up proper routing for SPA

### Environment Variables

#### Backend
* `DB_URL` - Database connection URL
* `DB_USERNAME` - Database username
* `DB_PASSWORD` - Database password
* `JWT_SECRET` - JWT signing secret
* `RAZORPAY_KEY_ID` - Payment gateway key
* `RAZORPAY_KEY_SECRET` - Payment gateway secret

#### Frontend
* `VITE_API_BASE_URL` - Backend API base URL
* `VITE_RAZORPAY_KEY_ID` - Razorpay public key

---

## 📊 Database Schema

### Core Entities

#### Users Table
* `id` (Primary Key)
* `username` (Unique)
* `email` (Unique)
* `password` (Encrypted)
* `firstName`, `lastName`
* `phoneNumber`, `address`
* `role` (CUSTOMER/ADMIN)
* `enabled`, `createdAt`, `updatedAt`

#### Customers Table (Extends Users)
* `visitCount` - Track user engagement
* `purchaseCount` - Track purchase history
* `lastVisitAt` - Last activity timestamp

#### Admins Table (Extends Users)
* `isVerified` - Verification status (0/1)
* `verifiedByAdminId` - Who verified this admin
* `verifiedAt` - Verification timestamp
* `upiId` - Payment details
* `requestReason` - Admin request justification
* `experience` - Previous experience
* `loginCount`, `lastLoginAt` - Activity tracking

#### Products Table
* `id`, `name`, `description`, `brand`
* `price`, `category`
* `releaseDate`, `productAvailable`
* `stockQuantity`
* `imageName`, `imageType`, `imagePath`
* `imageDate` (BLOB) - Image data

#### Orders Table
* `id`, `orderNumber` (Unique)
* `customerId` (Foreign Key, nullable for guest orders)
* `totalAmount`, `status`
* `orderDate`, `shippingAddress`
* `paymentMethod`, `paymentStatus`

#### CartItems Table
* `id`, `customerId`, `productId`
* `quantity`, `addedAt`

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
* Follow existing code style and conventions
* Add tests for new features
* Update documentation as needed
* Ensure security best practices

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

* **Spring Boot** - Excellent framework for rapid development
* **React** - Powerful frontend library
* **Bootstrap** - Beautiful UI components
* **JWT** - Secure authentication standard
* **MySQL** - Reliable database system

---

## 📞 Support

For support and questions:
* Create an issue in the repository
* Check existing documentation
* Review the test files for usage examples

**Happy Coding! 🚀**

