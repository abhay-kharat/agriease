# 🌾 AgriEase - Agricultural Technology Platform

A comprehensive full-stack agricultural platform connecting farmers with suppliers, featuring AI-powered plant disease detection, equipment booking, product marketplace, and intelligent farming assistance.

## 🎯 Platform Overview

AgriEase is a modern agricultural technology solution that empowers farmers with digital tools for:

- **🤖 AI Plant Disease Detection** - Deep learning-powered crop health analysis
- **🛒 Agricultural Marketplace** - Products, seeds, fertilizers, and equipment
- **📱 Equipment Rental** - Book tractors and farming machinery  
- **🎯 Smart Recommendations** - AI-driven crop and farming advice
- **💳 Digital Payments** - UPI integration for seamless transactions
- **📊 Order Management** - Per-farmer sequential order tracking
- **🌍 Multi-language Support** - Available in multiple regional languages

## 🏗️ Architecture

```
AgriEase Platform/
├── 🖥️  Backend (Spring Boot)      # Java 17 + PostgreSQL
├── 🌐  Frontend (React)          # React 18 + Vite
├── 🤖  AI Service (Flask)        # Python 3.8 + PyTorch
├── 🗄️  Database (PostgreSQL)     # Relational data store
├── 📝  Scripts & Utilities       # Helper scripts
└── 🚀  Deployment Configs        # Docker, migration scripts
```

## 🚀 Quick Start Guide

### Prerequisites
- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)  
- **Python 3.8+** (for AI service)
- **PostgreSQL** (database)
- **Maven** (for Java build)

### 1. Database Setup

```bash
# Install PostgreSQL and create database
createdb agriease_db

# Run schema and seed data
psql -U postgres -d agriease_db -f schema.sql

# Run order numbering migration (if upgrading)
./run-order-fix.bat
```

### 2. Backend Setup (Spring Boot)

```bash
cd Agriease/backend

# Configure database connection in application.properties
# spring.datasource.url=jdbc:postgresql://localhost:5432/agriease_db
# spring.datasource.username=postgres
# spring.datasource.password=your_password

# Install dependencies and run
mvn clean install
mvn spring-boot:run

# Backend runs on: http://localhost:8080
```

### 3. Frontend Setup (React)

```bash
cd Agriease/frontend

# Install dependencies
npm install

# Configure environment (optional - for chatbot)
cp .env.example .env
# Add VITE_GROK_API_KEY=your_grok_api_key_here

# Start development server
npm run dev

# Frontend runs on: http://localhost:5173
```

### 4. AI Service Setup (Flask) 

```bash
cd "Agriease/ai-backend/Flask Deployed App"

# Install dependencies
pip install -r requirements.txt

# Download AI model (required)
# Download plant_disease_model_1.pt from:
# https://drive.google.com/drive/folders/1ewJWAiduGuld_9oGSrTuLumg9y62qS6A

# Run AI service
python app.py

# AI service runs on: http://localhost:5000
```

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/agriease_db
spring.datasource.username=postgres
spring.datasource.password=Pass@1234

# Server
server.port=8080

# File upload
spring.servlet.multipart.max-file-size=10MB
```

### Frontend Configuration (`.env`)
```env
# Grok AI Chatbot (Optional)
VITE_GROK_API_KEY=your_grok_api_key_here

# Backend API URL (if different)
VITE_API_BASE_URL=http://localhost:8080
```

## 🛠️ Technology Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3** - Framework  
- **Spring Security** - Authentication & authorization
- **JPA/Hibernate** - ORM
- **PostgreSQL** - Primary database
- **Maven** - Dependency management

### Frontend  
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Toastify** - Notifications

### AI Service
- **Python 3.8** - Programming language
- **Flask** - Web framework
- **PyTorch** - Deep learning
- **OpenCV** - Image processing
- **NumPy/Pandas** - Data processing

## 📱 Features

### For Farmers
- **User Registration & Authentication** with role-based access
- **AI Plant Disease Detection** - Upload crop photos for instant diagnosis
- **Product Marketplace** - Browse and purchase seeds, fertilizers, tools
- **Equipment Rental** - Book tractors, harvesters, and farming equipment
- **Order Management** - Track orders with farmer-specific numbering (1,2,3...)
- **Digital Payments** - UPI QR code integration for secure payments
- **AI Chatbot** - Get farming advice and answers to crop questions
- **Profile Management** - Update farm details, crop types, contact info

### For Suppliers  
- **Product Management** - Add/edit products, set pricing and availability
- **Equipment Listings** - List rental equipment with daily rates
- **Order Processing** - Manage incoming orders, update status
- **Inventory Tracking** - Monitor stock levels and sales
- **Customer Communication** - Direct contact with farmers

### Admin Features
- **User Management** - Manage farmer and supplier accounts
- **Content Moderation** - Review and approve listings
- **Analytics Dashboard** - Track platform usage and sales
- **System Monitoring** - Monitor AI service performance

## 🔄 Recent Updates

### ✅ Order Number System Fix (Latest)
Implemented farmer-specific sequential order numbering:

- **Problem Fixed**: Orders now use per-farmer numbering (1,2,3...) instead of global IDs
- **Auto-Resequencing**: When orders are deleted, remaining orders resequence automatically
- **Database Migration**: Added `display_order_number` column
- **API Updates**: Returns both legacy `orderNumber` and new `displayOrderNumber`

**Migration Required**: Run `./run-order-fix.bat` to upgrade existing installations

### 🎨 Payment UI Redesign
- Redesigned UPI payment interface to match Razorpay standards
- Added countdown timer for payment completion
- Enhanced QR code presentation with supported UPI apps
- Improved security indicators and professional styling

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Farmer/Supplier/Admin roles  
- **Password Encryption** - BCrypt hashing
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Controlled cross-origin requests
- **File Upload Security** - Type and size validation

## 🌐 API Documentation

### Authentication Endpoints
```
POST /auth/register    # User registration
POST /auth/login       # User login
GET  /auth/profile     # Get user profile
```

### Farmer Endpoints
```  
GET    /farmer/orders           # Get my orders
POST   /farmer/orders           # Create new order
DELETE /farmer/orders/{id}      # Delete completed order
POST   /farmer/orders/resequence # Resequence order numbers
PUT    /farmer/orders/{id}/cancel # Cancel pending order
```

### Supplier Endpoints
```
GET  /supplier/orders          # Get orders for my products
PUT  /supplier/orders/{id}/status # Update order status  
GET  /supplier/products        # Get my products
POST /supplier/products        # Add new product
```

### AI Endpoints
```
POST /ai/disease-detection     # Analyze plant image
GET  /ai/disease-info         # Get disease information
POST /ai/recommendations      # Get crop recommendations
```

## 🧪 Testing

### Backend Testing
```bash
cd Agriease/backend
mvn test                    # Run unit tests
mvn integration-test        # Run integration tests
```

### Frontend Testing  
```bash
cd Agriease/frontend
npm test                    # Run Jest tests
npm run test:e2e            # Run Cypress E2E tests
```

### Manual Testing
1. **User Registration**: Test farmer/supplier registration flow
2. **Product Browsing**: Browse marketplace, add items to cart
3. **Order Creation**: Place orders and verify farmer-specific numbering
4. **Payment Flow**: Test UPI payment with QR code generation
5. **AI Detection**: Upload plant images for disease detection
6. **Order Management**: Test order status updates and deletion

## 📦 Deployment

### Docker Deployment (Recommended)
```bash
# Build all services
docker-compose build

# Start all services  
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment
1. **Database**: Deploy PostgreSQL and run migrations
2. **Backend**: Package JAR and deploy to server
3. **Frontend**: Build static files and deploy to web server
4. **AI Service**: Deploy Flask app with model file

### Environment Variables for Production
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/agriease_db

# Security
JWT_SECRET=your-256-bit-secret
ENCRYPTION_KEY=your-encryption-key

# AI Service
AI_SERVICE_URL=https://your-ai-service.com

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret

# File Storage
AWS_S3_BUCKET=your-s3-bucket
CLOUDINARY_URL=your-cloudinary-url
```

## 🛠️ Development Guide

### Project Structure
```
Agriease/
├── backend/
│   ├── src/main/java/com/agriease/backend/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── entity/         # JPA entities
│   │   ├── dto/           # Data transfer objects
│   │   └── config/        # Configuration classes
│   └── src/test/          # Test cases
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Helper utilities
│   └── public/           # Static assets
└── ai-backend/
    ├── Flask Deployed App/ # Main Flask application
    ├── Model/             # Jupyter notebooks & training
    └── test_images/       # Sample images for testing
```

### Adding New Features

1. **Backend**: Create controller, service, repository, and entity
2. **Frontend**: Add components, pages, and API integration
3. **Database**: Update schema.sql and create migration scripts
4. **Testing**: Add unit and integration tests
5. **Documentation**: Update API docs and README

### Code Style
- **Java**: Follow Google Java Style Guide
- **JavaScript**: Use ESLint and Prettier  
- **Python**: Follow PEP 8 standards
- **Database**: Use snake_case for table/column names

## 🐛 Troubleshooting

### Common Issues

**Backend Won't Start**
```bash
# Check Java version
java -version  # Should be 17+

# Check database connection
psql -U postgres -d agriease_db

# Check port availability  
netstat -an | findstr :8080
```

**Frontend Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node -v  # Should be 18+
```

**AI Service Issues**
```bash
# Check Python version
python --version  # Should be 3.8+

# Install missing dependencies
pip install -r requirements.txt

# Download model file if missing
# Check Flask Deployed App folder for plant_disease_model_1.pt
```

**Database Migration Issues**
```bash
# Reset database if needed
dropdb agriease_db
createdb agriease_db
psql -U postgres -d agriease_db -f schema.sql

# Run order fix migration
./run-order-fix.bat
```

## 📊 Performance Optimization

### Database
- **Indexing**: Proper indexes on frequently queried columns
- **Connection Pooling**: HikariCP for efficient connection management
- **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

### Frontend
- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: WebP format for smaller file sizes
- **Caching**: Service worker for offline functionality

### AI Service
- **Model Optimization**: Quantized models for faster inference
- **Caching**: Redis for frequent disease lookups
- **Batch Processing**: Process multiple images together

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Write comprehensive tests for new features
- Follow existing code style and conventions
- Update documentation for API changes
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Plant Village Dataset** - For training the disease detection model
- **Spring Boot Community** - For the excellent framework
- **React Community** - For the UI library and ecosystem  
- **PyTorch Team** - For the deep learning framework
- **Contributors** - All developers who helped build this platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/agriease/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/agriease/discussions)  
- **Email**: support@agriease.com
- **Documentation**: [Wiki](https://github.com/your-username/agriease/wiki)

---

**Made with 💚 for farmers worldwide** 🌾

### Migration Folder Contains:
- ✅ Supabase cloud database scripts (NEW!)
- ✅ Environment check script
- 📦 Database export/import scripts
- ⚙️ Setup scripts for backend, frontend, and AI backend
- 🚀 Start/stop all services scripts
- 📖 Comprehensive documentation
- ✓ Migration checklist
- 🔧 Configuration update utilities

👉 **[Go to Migration Folder](migration/)** for detailed instructions.

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 4.0.2
- **Language:** Java 17
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Payment:** Razorpay Integration

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **UI:** Custom CSS with Framer Motion

### AI Backend
- **Framework:** Flask
- **ML Library:** PyTorch
- **Model:** CNN for Plant Disease Detection
- **Image Processing:** PIL, torchvision

## 📋 Prerequisites

- **Java:** 17 or higher
- **Maven:** 3.6+
- **Node.js:** 18 or higher
- **Python:** 3.8 or higher
- **PostgreSQL:** 12 or higher

## 🌐 Default Ports

- **Backend API:** http://localhost:8080/agriease
- **Frontend:** http://localhost:5173
- **AI Backend:** http://localhost:5000
- **Database:** localhost:5432

## 📊 Database

Database name: `agriease_db`

Main tables:
- `users` - User accounts (farmers, suppliers)
- `products` - Agricultural products
- `equipment` - Equipment for booking
- `orders` - Product orders
- `order_items` - Order details
- `bookings` - Equipment bookings
- `plant_disease_reports` - AI disease detection results

## 🔐 Configuration

Backend configuration: `Agriease/backend/src/main/resources/application.properties`

Key settings:
- Database connection
- JWT secret
- Razorpay API keys
- Server port and context path

## ✨ Features

### For Farmers:
- 🛒 Browse and purchase agricultural products
- 🚜 Book equipment
- 🌱 Plant disease detection using AI
- 📊 Order history and tracking
- 💳 Integrated payment gateway
- 🤖 AI-powered chatbot assistance
- 🌤️ Weather information

### For Suppliers:
- 📦 Product management
- 🚜 Equipment listing
- 📈 Order management
- 💼 Business dashboard

### AI Features:
- 🔬 Plant disease detection
- 📸 Image-based diagnosis
- 💊 Treatment recommendations
- 📊 Confidence scoring

## 🆘 Need Help?

- **Migration Issues:** See [Migration Guide](migration/MIGRATION-GUIDE.md)
- **Quick Start:** See [Quick Start Guide](migration/QUICK-START.md)
- **Checklist:** Use [Migration Checklist](migration/MIGRATION-CHECKLIST.md)

## 📝 Important Notes

1. **Default Database Password:** `Pass@1234` (update in application.properties if different)
2. **Razorpay Keys:** Currently using test keys (update for production)
3. **File Uploads:** Stored in `backend/uploads/plant-images/`
4. **AI Model:** Large PyTorch model file (~930MB) required for disease detection

## 🔄 System Requirements

### Minimum:
- 4GB RAM
- 10GB free disk space
- Windows 10/11, macOS, or Linux

### Recommended:
- 8GB RAM
- 20GB free disk space
- SSD for better performance

## 📦 Backup & Migration

Regular backups recommended:
1. Database: Use `migration/1-export-database.bat`
2. Uploaded files: Copy `backend/uploads/` folder
3. Configuration: Backup `application.properties`

## 🎯 Development

### Backend:
```batch
cd Agriease\backend
mvn clean install
mvn spring-boot:run
```

### Frontend:
```batch
cd Agriease\frontend
npm install
npm run dev
```

### AI Backend:
```batch
cd "Agriease\ai-backend\Flask Deployed App"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 🚀 Production Deployment

1. Update database credentials
2. Generate new JWT secret
3. Update Razorpay keys to production keys
4. Build frontend: `npm run build`
5. Package backend: `mvn clean package`
6. Deploy on production server
7. Configure reverse proxy (nginx/Apache)
8. Enable HTTPS
9. Set up automated backups

## 📄 License

This is a college project for educational purposes.

---

**Happy Farming! 🌾**

For migration assistance, visit the **[migration folder](migration/)** 📦
