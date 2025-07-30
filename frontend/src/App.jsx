import { useState, useEffect } from 'react'

const App = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isOverInteractive, setIsOverInteractive] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [isSignIn, setIsSignIn] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [passwords, setPasswords] = useState([])
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [passwordFormData, setPasswordFormData] = useState({
    name: '',
    website: '',
    username: '',
    password: ''
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [copyingPasswordId, setCopyingPasswordId] = useState(null)
  const [isGoogleButtonRendered, setIsGoogleButtonRendered] = useState(false)

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = "303844320925-likklotktp1p61p0ark6iqavhjccuq4b.apps.googleusercontent.com"

  // Fetch user passwords
  const fetchUserPasswords = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/passwords', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPasswords(data)
      } else {
        console.error('Failed to fetch passwords')
      }
    } catch (error) {
      console.error('Error fetching passwords:', error)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    setPasswords([])
    setMessage({ type: 'success', text: 'Logged out successfully!' })
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 2000)
  }

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setIsAuthenticated(true)
        fetchUserPasswords(token)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      localStorage.removeItem('token')
    }
  }

  const handleGoogleResponse = async (response) => {
    try {
      setMessage({ type: 'info', text: 'Signing in with Google...' })
      
      // Send ID token to backend for verification
      const backendResponse = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential
        })
      })

      const data = await backendResponse.json()

      if (backendResponse.ok) {
        setMessage({ type: 'success', text: 'Google sign-in successful!' })
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setIsAuthenticated(true)
        fetchUserPasswords(data.token)
        
        setTimeout(() => {
          setShowCreateAccount(false)
          setIsSignIn(false)
          setMessage({ type: '', text: '' })
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.message || 'Google sign-in failed' })
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      setMessage({ type: 'error', text: 'Failed to process Google sign-in' })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Check if Google script is loaded
      if (typeof window.google === 'undefined') {
        setMessage({ type: 'error', text: 'Google Sign-In is loading. Please wait and try again.' })
        return
      }

      setMessage({ type: '', text: '' })

      // Try to trigger the Google sign-in prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt not displayed:', notification.getMomentType())
          setMessage({ type: 'info', text: 'Please use the Google sign-in button below.' })
        }
      })

    } catch (error) {
      console.error('Google sign-in error:', error)
      setMessage({ type: 'error', text: 'Google sign-in failed. Please try again.' })
    }
  }

  const handleCopyPassword = async (passwordId) => {
    setCopyingPasswordId(passwordId)
    
    try {
      const response = await fetch(`http://localhost:5000/api/passwords/${passwordId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const passwordData = await response.json()
        const decryptedPassword = passwordData.password || passwordData.decryptedPassword
        
        if (decryptedPassword) {
          await navigator.clipboard.writeText(decryptedPassword)
          setMessage({ type: 'success', text: 'Password copied to clipboard!' })
          
          // Clear success message after 2 seconds
          setTimeout(() => {
            setMessage({ type: '', text: '' })
          }, 2000)
        } else {
          setMessage({ type: 'error', text: 'Could not decrypt password' })
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch password' })
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        setMessage({ type: 'error', text: 'Clipboard access denied. Please allow clipboard permissions.' })
      } else {
        setMessage({ type: 'error', text: 'Failed to copy password' })
      }
    }
    
    setCopyingPasswordId(null)
  }

  const handlePasswordInputChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setIsSavingPassword(true)

    try {
      const response = await fetch('http://localhost:5000/api/passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(passwordFormData)
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new password to the passwords array
        setPasswords([...passwords, data.password])
        // Clear form and close modal
        setPasswordFormData({ name: '', website: '', username: '', password: '' })
        setShowAddPassword(false)
        setMessage({ type: 'success', text: data.message || 'Password saved successfully!' })
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Failed to save password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }

    setIsSavingPassword(false)
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Master password must be at least 8 characters long' })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          masterPassword: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account created successfully! Please sign in.' })
        // Clear form
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        // Switch to sign in after a delay
        setTimeout(() => {
          setIsSignIn(true)
          setMessage({ type: '', text: '' })
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check if the server is running.' })
    }

    setIsSubmitting(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          masterPassword: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sign in successful!' })
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        // Set user data and authentication state
        setUser(data.user)
        setIsAuthenticated(true)
        // Fetch user passwords
        fetchUserPasswords(data.token)
        // Close modal after success
        setTimeout(() => {
          setShowCreateAccount(false)
          setIsSignIn(false)
          setMessage({ type: '', text: '' })
          setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to sign in' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check if the server is running.' })
    }

    setIsSubmitting(false)
  }

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    }
  }, [])

  // Initialize Google OAuth when auth modal is shown
  useEffect(() => {
    if (showCreateAccount && window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          })

      // Try to render the Google button
      const buttonContainer = document.getElementById('google-signin-button')
      if (buttonContainer && buttonContainer.innerHTML === '') {
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '280',
            text: 'continue_with',
            shape: 'rectangular',
          })
          setIsGoogleButtonRendered(true)
        } catch (error) {
          console.log('Google button render failed:', error)
          setIsGoogleButtonRendered(false)
        }
      }
    } else {
      setIsGoogleButtonRendered(false)
    }
  }, [showCreateAccount])

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
      
      // Check if mouse is over an interactive element (button, text, etc.)
      const element = document.elementFromPoint(ev.clientX, ev.clientY)
      const isInteractive = element && (
        element.tagName === 'BUTTON' || 
        element.tagName === 'A' ||
        element.tagName === 'SPAN' ||
        element.tagName === 'H1' ||
        element.tagName === 'H2' ||
        element.tagName === 'P' ||
        element.tagName === 'DIV' && (element.textContent && element.textContent.trim().length > 0)
      )
      setIsOverInteractive(isInteractive)
    }
    window.addEventListener('mousemove', updateMousePosition)
    
    // Hide loading screen after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    // Check for existing authentication
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
            setIsAuthenticated(true)
            fetchUserPasswords(token)
          } else {
            localStorage.removeItem('token')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
        }
      }
    }

    checkAuth()

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      clearTimeout(timer)
    }
  }, [])

  // Spiral Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
        {/* Multiple Spinning Spirals */}
        <div className="relative">
          {/* Large Spiral */}
          <div className="absolute animate-spin w-96 h-96 border-4 border-blue-200 border-t-blue-600 rounded-full -top-48 -left-48"></div>
          
          {/* Medium Spiral */}
          <div className="absolute animate-spin w-64 h-64 border-4 border-purple-200 border-t-purple-600 rounded-full -top-32 -left-32 animation-delay-200" style={{animationDirection: 'reverse'}}></div>
          
          {/* Small Spiral */}
          <div className="absolute animate-spin w-32 h-32 border-4 border-green-200 border-t-green-600 rounded-full -top-16 -left-16 animation-delay-400"></div>
          
          {/* Tiny Spiral */}
          <div className="absolute animate-spin w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full -top-8 -left-8 animation-delay-600" style={{animationDirection: 'reverse'}}></div>
          
          {/* Center Loading Text */}
          <div className="relative z-10 text-center">
            <div className="animate-pulse text-4xl font-bold text-gray-800 mb-4 bitcount-grid-single-passkey">
              Loading PassKey...
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        </div>
        
        {/* Additional Floating Spirals */}
        <div className="absolute top-10 left-10 animate-spin w-20 h-20 border-2 border-red-200 border-t-red-500 rounded-full animation-delay-100"></div>
        <div className="absolute top-20 right-20 animate-spin w-24 h-24 border-2 border-indigo-200 border-t-indigo-500 rounded-full animation-delay-300" style={{animationDirection: 'reverse'}}></div>
        <div className="absolute bottom-20 left-20 animate-spin w-16 h-16 border-2 border-pink-200 border-t-pink-500 rounded-full animation-delay-500"></div>
        <div className="absolute bottom-10 right-10 animate-spin w-28 h-28 border-2 border-teal-200 border-t-teal-500 rounded-full animation-delay-700" style={{animationDirection: 'reverse'}}></div>
      </div>
    )
  }

  // Dashboard Component
  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen animate-fade-in">
        {/* Mouse Follower Dot */}
        <div 
          className={`fixed rounded-full pointer-events-none z-50 transition-all duration-200 ease-out ${
            isOverInteractive 
              ? 'w-8 h-8 bg-blue-400 opacity-80 border-2 border-blue-600' 
              : 'w-4 h-4 bg-blue-500 opacity-100'
          }`}
          style={{
            left: `${mousePosition.x - (isOverInteractive ? 16 : 8)}px`,
            top: `${mousePosition.y - (isOverInteractive ? 16 : 8)}px`,
            transform: 'translate(0, 0)',
            boxShadow: isOverInteractive 
              ? '0 0 25px rgba(59, 130, 246, 0.7)' 
              : '0 0 20px rgba(59, 130, 246, 0.5)'
          }}
        />

        {/* Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Dashboard Navbar */}
        <nav className="flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 h-[10vh] border-b border-gray-200 bg-white">
          {/* Logo and User Info */}
          <div className="flex items-center space-x-4">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bitcount-grid-single-passkey font-bold">
              PassKey
            </h1>
            <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium">Welcome, {user?.name}</span>
            </div>
          </div>

          {/* Password Count and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Password Count */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-blue-600 font-medium text-sm">
                {passwords.length} Password{passwords.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Add Password Button */}
            <button 
              onClick={() => setShowAddPassword(true)}
              className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs sm:text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bitcount-grid-single-passkey">
                Your Password Vault
              </h2>
              <p className="text-gray-600">
                Manage your passwords securely and efficiently
              </p>
            </div>

            {/* Passwords Grid */}
            {passwords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {passwords.map((password, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {password.name || password.website || 'Untitled'}
                      </h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Website:</span> {password.website}</p>
                      <p><span className="font-medium">Username:</span> {password.username}</p>
                      <p><span className="font-medium">Password:</span> ••••••••</p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => handleCopyPassword(password._id)}
                        disabled={copyingPasswordId === password._id}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {copyingPasswordId === password._id ? (
                          <>
                            <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Copying...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No Passwords State
              <div className="text-center py-12 sm:py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  No passwords stored yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start building your secure password vault by adding your first password.
                </p>
                <button 
                  onClick={() => setShowAddPassword(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Password
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Add Password Modal */}
        {showAddPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold bitcount-grid-single-passkey">
                  Add New Password
                </h2>
                <button 
                  onClick={() => setShowAddPassword(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={passwordFormData.name}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Gmail Account"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website/URL
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={passwordFormData.website}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="gmail.com or https://gmail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username/Email
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={passwordFormData.username}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={passwordFormData.password}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPassword(false)
                        setPasswordFormData({ name: '', website: '', username: '', password: '' })
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingPassword ? 'Saving...' : 'Save Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen animate-fade-in">
      {/* Mouse Follower Dot */}
      <div 
        className={`fixed rounded-full pointer-events-none z-50 transition-all duration-200 ease-out ${
          isOverInteractive 
            ? 'w-8 h-8 bg-blue-400 opacity-80 border-2 border-blue-600' 
            : 'w-4 h-4 bg-blue-500 opacity-100'
        }`}
        style={{
          left: `${mousePosition.x - (isOverInteractive ? 16 : 8)}px`,
          top: `${mousePosition.y - (isOverInteractive ? 16 : 8)}px`,
          transform: 'translate(0, 0)',
          boxShadow: isOverInteractive 
            ? '0 0 25px rgba(59, 130, 246, 0.7)' 
            : '0 0 20px rgba(59, 130, 246, 0.5)'
        }}
      />

      {/* Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 h-[10vh] border-b border-gray-200">
        {/* Logo */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl bitcount-grid-single-passkey font-bold">
            PassKey
          </h1>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          {/* GitHub Button */}
          <button 
            onClick={() => window.open('https://github.com/thebedigupta/PassKey', '_blank')}
            className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 border-2 border-dotted border-gray-400 rounded-lg hover:border-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1 sm:space-x-2"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" 
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-xs sm:text-sm md:text-base">GitHub</span>
          </button>

          {/* Login Button */}
          <button 
            onClick={() => {
              setShowCreateAccount(true)
              setIsSignIn(true)
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-xs sm:text-sm md:text-base"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="h-[90vh] flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated PassKey Text */}
          <div className="relative mb-4 sm:mb-6">
            <div className="animate-bounce text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 mb-2 bitcount-grid-single-passkey">
              <span className="inline-block animate-pulse">P</span>
              <span className="inline-block animate-pulse animation-delay-100">a</span>
              <span className="inline-block animate-pulse animation-delay-200">s</span>
              <span className="inline-block animate-pulse animation-delay-300">s</span>
              <span className="inline-block animate-pulse animation-delay-400">K</span>
              <span className="inline-block animate-pulse animation-delay-500">e</span>
              <span className="inline-block animate-pulse animation-delay-600">y</span>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Secure Password Manager
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Keep your passwords safe and accessible across all your devices
          </p>
          <button 
            onClick={() => setShowCreateAccount(true)}
            className="px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base md:text-lg font-medium"
          >
            Get Started
          </button>
        </div>
      </main>

      {/* Create Account / Sign In Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bitcount-grid-single-passkey">
                {isSignIn ? 'Sign In' : 'Create Account'}
              </h2>
              <button 
                onClick={() => {
                  setShowCreateAccount(false)
                  setIsSignIn(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Message Display */}
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : message.type === 'info'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {message.text}
                </div>
              )}

              {!isSignIn ? (
                // Create Account Form
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Master Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create a strong master password (min 8 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Master Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your master password"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              ) : (
                // Sign In Form
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Master Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your master password"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      Forgot password?
                    </a>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Toggle between Sign In and Create Account */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignIn ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsSignIn(!isSignIn)
                      setMessage({ type: '', text: '' })
                      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isSignIn ? 'Create Account' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
              </div>

              {/* Social Login Options */}
              <div className="mt-6">
                {/* Container for Google-rendered button */}
                <div id="google-signin-button" className="mb-3 flex justify-center"></div>
                
                {/* Fallback custom button - only show if Google button isn't rendered */}
                {!isGoogleButtonRendered && (
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
