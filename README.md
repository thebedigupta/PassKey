# 🔐 PassKey - Secure Password Manager

A modern, full-stack password manager built with the MERN stack, featuring end-to-end encryption and a beautiful user interface powered by Tailwind CSS 4.0.

![PassKey Banner](https://img.shields.io/badge/PassKey-Password%20Manager-blue?style=for-the-badge&logo=shield&logoColor=white)

## ✨ Features

- 🔒 **End-to-End Encryption** - AES-256 encryption for all stored passwords
- 🚀 **Modern Tech Stack** - Built with React 19, Node.js, Express, and MongoDB
- 🎨 **Beautiful UI** - Designed with Tailwind CSS 4.1.11
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 🛡️ **Security First** - Rate limiting, CORS protection, and security headers
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast & Efficient** - Optimized performance with Vite 7.0.6

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0** - Modern UI library with latest features
- **Tailwind CSS 4.1.11** - Utility-first CSS framework with new architecture
- **Vite 7.0.6** - Lightning-fast build tool
- **React Router DOM 7.7.1** - Client-side routing
- **Axios 1.11.0** - HTTP client for API requests
- **Headless UI & Heroicons** - Accessible UI components and icons

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **crypto** - AES-256 encryption for passwords

### Security & DevOps

- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **dotenv** - Environment variable management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/thebedigupta/PassKey.git
   cd PassKey
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `server` directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_atlas_connection_string

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   JWT_EXPIRES_IN=7d

   # Encryption Key (32 characters)
   ENCRYPTION_KEY=your_32_character_encryption_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   ```

5. **Configure frontend environment**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

#### Development Mode

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5174`

#### Production Mode

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd server
   npm start
   ```

## 📁 Project Structure

```
PassKey/
├── server/                 # Backend application
│   ├── models/            # Database models
│   │   ├── User.js        # User model with authentication
│   │   └── Password.js    # Password model with encryption
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   └── passwords.js   # Password management routes
│   ├── middleware/        # Custom middleware
│   ├── .env              # Environment variables
│   ├── package.json      # Backend dependencies
│   └── server.js          # Express server setup
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context providers
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # React entry point
│   ├── public/            # Static assets
│   ├── .env              # Frontend environment variables
│   ├── package.json      # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   └── vite.config.js     # Vite configuration
│
├── docs/                  # Documentation
└── README.md             # Project documentation
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Password Management

- `GET /api/passwords` - Get all user passwords
- `POST /api/passwords` - Create a new password entry
- `PUT /api/passwords/:id` - Update a password entry
- `DELETE /api/passwords/:id` - Delete a password entry

## 🔒 Security Features

### Encryption

- **AES-256 Encryption** - All passwords are encrypted before storage
- **Unique Salt** - Each password has a unique initialization vector
- **Zero-Knowledge Architecture** - Server never sees plaintext passwords

### Authentication

- **JWT Tokens** - Secure stateless authentication
- **Password Hashing** - bcrypt with salt rounds for user passwords
- **Token Expiration** - Automatic token expiry for security

### API Security

- **Rate Limiting** - Prevents brute force attacks
- **CORS Protection** - Controlled cross-origin requests
- **Security Headers** - Helmet.js for security headers
- **Input Validation** - Comprehensive input sanitization

## 🎨 Tailwind CSS 4.0 Features

This project uses the latest Tailwind CSS 4.1.11 with:

- **New PostCSS Architecture** - Improved plugin system with `@tailwindcss/postcss`
- **Better Performance** - Faster build times and smaller bundle sizes
- **Enhanced Developer Experience** - Better error messages and debugging
- **Modern CSS Features** - Latest CSS specifications support
- **Improved Tree Shaking** - More efficient unused CSS removal

### Tailwind CSS 4.0 Migration Notes

- Updated PostCSS configuration to use `@tailwindcss/postcss` plugin
- Enhanced content detection for better purging
- Improved build performance and smaller output files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/thebedigupta/PassKey/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

## 🎯 Roadmap

- [ ] Password Generator with customizable options
- [ ] Import/Export functionality
- [ ] Browser extension
- [ ] Mobile application
- [ ] Two-factor authentication
- [ ] Password sharing capabilities
- [ ] Advanced search and filtering
- [ ] Password strength analytics
- [ ] Dark mode theme

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the amazing CSS framework
- [React](https://reactjs.org/) for the powerful UI library
- [MongoDB](https://www.mongodb.com/) for the robust database solution
- [Express.js](https://expressjs.com/) for the fast web framework

---

**⚠️ Security Notice**: This is an educational project. For production use, ensure proper security audits, use HTTPS, implement proper backup strategies, and follow security best practices.

**Made with ❤️ by [Bedi Gupta](https://github.com/thebedigupta)**

- 🔒 **Secure Storage** - Passwords encrypted with AES-256 encryption
- 🎯 **User-Friendly Interface** - Clean, modern UI built with React and Tailwind
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔍 **Search & Filter** - Quickly find your passwords
- 📊 **Categories** - Organize passwords by type (Logins, Cards, Notes)
- ⭐ **Favorites** - Mark frequently used passwords
- 🔄 **Password Generator** - Generate strong, secure passwords
- 📤 **Export Data** - Backup your passwords
- 🛡️ **Security Features** - Rate limiting, helmet security, JWT authentication

## 🚀 Quick Start

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/thebedigupta/PassKey.git
   cd PassKey
   ```

2. **Setup Backend**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
PassKey/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Different app pages
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                   # Node.js backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & other middleware
│   ├── controllers/        # Business logic
│   ├── package.json
│   └── server.js           # Main server file
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/passkey
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Database Setup

**Option 1: Local MongoDB**

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/passkey`

**Option 2: MongoDB Atlas (Cloud)**

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and add to `.env`

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify token

### Passwords

- `GET /api/passwords` - Get all passwords
- `POST /api/passwords` - Create new password
- `GET /api/passwords/:id` - Get single password
- `PUT /api/passwords/:id` - Update password
- `DELETE /api/passwords/:id` - Delete password
- `GET /api/passwords/:id/decrypt` - Get decrypted password
- `GET /api/passwords/stats/overview` - Get password statistics

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/change-password` - Change master password
- `DELETE /api/user/account` - Delete account
- `GET /api/user/export` - Export user data

## 🛠️ Development

### Running in Development Mode

**Backend:**

```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**

```bash
cd frontend
npm run dev  # Uses Vite dev server
```

### Building for Production

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**

```bash
cd server
npm start
```

## 🔐 Security Features

- **Password Encryption**: AES-256 encryption for stored passwords
- **Master Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Helmet Security**: Security headers
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Server-side validation
- **Environment Variables**: Sensitive data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Security Notes

1. **Change default secrets** in production
2. **Use HTTPS** in production
3. **Keep dependencies updated**
4. **Regular security audits**
5. **Backup your data regularly**

## 📞 Support

If you encounter any issues or have questions:

- Create an [issue](https://github.com/thebedigupta/PassKey/issues)
- Check existing issues for solutions
- Read through this README for setup help

---

**Made with ❤️ for a more secure digital life**
