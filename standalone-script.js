// Standalone version - NO Supabase required!
// All functions work with local simulation

// Global variables
let selectedAmount = 0
let selectedFrequency = "once"
let currentUser = null
let donations = [] // Local storage for demo
let users = [] // Local storage for demo

// Simulate database with localStorage
const localDB = {
  saveDonation: async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const donation = {
      id: Date.now(),
      ...data,
      transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      created_at: new Date().toISOString()
    }
    
    donations.push(donation)
    localStorage.setItem('donations', JSON.stringify(donations))
    return { success: true, data: donation }
  },

  signIn: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      currentUser = user
      localStorage.setItem('currentUser', JSON.stringify(user))
      return { success: true, data: { user } }
    }
    return { success: false, error: 'Invalid credentials' }
  },

  signUp: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'User already exists' }
    }
    
    const user = {
      id: Date.now(),
      ...userData,
      role: 'user',
      created_at: new Date().toISOString()
    }
    
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))
    return { success: true, data: user }
  },

  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    currentUser = null
    localStorage.removeItem('currentUser')
    return { success: true }
  },

  getCurrentUser: async () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser = JSON.parse(stored)
      return { success: true, user: currentUser }
    }
    return { success: false, user: null }
  },

  isAdmin: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const user = users.find(u => u.id === userId)
    return user?.role === 'admin'
  },

  getDonations: async (limit = 50) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { 
      success: true, 
      data: donations.slice(-limit).reverse() 
    }
  },

  getDonationStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0)
    const totalDonors = new Set(donations.map(d => d.email)).size
    const today = new Date().toDateString()
    const todaysDonations = donations.filter(d => 
      new Date(d.created_at).toDateString() === today
    ).length
    const monthlyDonors = donations.filter(d => d.frequency === 'monthly').length

    return {
      success: true,
      stats: {
        totalRaised,
        totalDonors,
        todaysDonations,
        monthlyDonors
      }
    }
  }
}

// Initialize from localStorage
function initializeLocalData() {
  const storedDonations = localStorage.getItem('donations')
  const storedUsers = localStorage.getItem('users')
  const storedUser = localStorage.getItem('currentUser')
  
  if (storedDonations) donations = JSON.parse(storedDonations)
  if (storedUsers) users = JSON.parse(storedUsers)
  if (storedUser) currentUser = JSON.parse(storedUser)
  
  // Add demo admin user if none exists
  if (users.length === 0) {
    users.push({
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString()
    })
    localStorage.setItem('users', JSON.stringify(users))
  }
  
  // Add some demo donations if none exist
  if (donations.length === 0) {
    const demoDonations = [
      {
        id: 1,
        amount: 250,
        frequency: 'once',
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US',
        cellNumber: '555-0123',
        transaction_id: 'TXN_DEMO_001',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
      },
      {
        id: 2,
        amount: 100,
        frequency: 'monthly',
        email: 'sarah.smith@email.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        address: '456 Oak Ave',
        city: 'Springfield',
        state: 'NY',
        zipCode: '67890',
        country: 'US',
        cellNumber: '555-0456',
        transaction_id: 'TXN_DEMO_002',
        status: 'completed',
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ]
    
    donations = demoDonations
    localStorage.setItem('donations', JSON.stringify(donations))
  }
}

// DOM elements
const amountButtons = document.querySelectorAll(".amount-btn")
const customAmountInput = document.getElementById("customAmount")
const frequencyButtons = document.querySelectorAll(".frequency-btn")
const cardPaymentBtn = document.getElementById("cardPaymentBtn")
const donationForm = document.getElementById("donationForm")
const paymentProcess = document.getElementById("paymentProcess")
const navTabs = document.querySelectorAll(".nav-tab")
const tabContents = document.querySelectorAll(".tab-content")

// Authentication elements
const authModal = document.getElementById("authModal")
const signInForm = document.getElementById("signInForm")
const signUpForm = document.getElementById("signUpForm")
const switchToSignUp = document.getElementById("switchToSignUp")
const switchToSignIn = document.getElementById("switchToSignIn")
const closeModal = document.querySelector(".close")
const loadingOverlay = document.getElementById("loadingOverlay")

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeLocalData()
  initializeAmountButtons()
  initializeFrequencyButtons()
  initializePaymentFlow()
  initializeAuthentication()
  initializeAnimations()
  checkCurrentUser()

  // Add real-time validation for country dropdown
  const countrySelect = document.getElementById("country")
  if (countrySelect) {
    countrySelect.addEventListener("change", function () {
      if (this.value) {
        this.classList.add("valid")
        this.classList.remove("invalid")
        this.style.borderColor = "#27ae60"
      } else {
        this.classList.remove("valid")
        this.style.borderColor = "#ddd"
      }
    })
  }

  // Add real-time validation for all required fields
  const requiredFields = ["email", "firstName", "lastName", "address", "city", "state", "zipCode"]
  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (field) {
      field.addEventListener("blur", function () {
        if (this.value.trim()) {
          if (fieldId === "email" && !validateEmail(this.value)) {
            this.classList.add("invalid")
            this.classList.remove("valid")
            this.style.borderColor = "#e74c3c"
          } else {
            this.classList.add("valid")
            this.classList.remove("invalid")
            this.style.borderColor = "#27ae60"
          }
        } else {
          this.classList.remove("valid", "invalid")
          this.style.borderColor = "#ddd"
        }
      })
    }
  })
})

// Check current user and update UI
async function checkCurrentUser() {
  const result = await localDB.getCurrentUser()
  if (result.user) {
    updateAuthUI(true, result.user)
  }
}

// Show/hide loading overlay
function showLoading(message = "Processing...") {
  const overlay = document.getElementById("loadingOverlay")
  const text = overlay.querySelector("p")
  text.textContent = message
  overlay.classList.remove("hidden")
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden")
}

// Amount selection functionality
function initializeAmountButtons() {
  amountButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      amountButtons.forEach((btn) => btn.classList.remove("selected"))

      // Add active class to clicked button
      this.classList.add("selected")

      // Set selected amount
      selectedAmount = parseInt(this.dataset.amount)

      // Clear custom amount input
      customAmountInput.value = ""

      // Add animation
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })

  // Custom amount input
  customAmountInput.addEventListener("input", function () {
    // Remove active class from all amount buttons
    amountButtons.forEach((btn) => btn.classList.remove("selected"))

    // Set selected amount
    selectedAmount = parseInt(this.value) || 0
  })
}

// Frequency selection functionality
function initializeFrequencyButtons() {
  frequencyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      frequencyButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Set selected frequency
      selectedFrequency = this.dataset.frequency

      // Add animation
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })
}

// Payment flow functionality with step validation
function initializePaymentFlow() {
  cardPaymentBtn.addEventListener("click", () => {
    if (selectedAmount === 0) {
      showNotification("Please select an amount first.", "error")
      return
    }

    // Hide donation form and show payment process
    donationForm.classList.add("hidden")
    paymentProcess.classList.remove("hidden")

    // Update selected amount display
    document.getElementById("selectedAmountDisplay").textContent = selectedAmount
    document.getElementById("selectedFrequency").textContent = selectedFrequency === "once" ? "One-time" : "Monthly"
    document.getElementById("finalAmount").textContent = selectedAmount

    // Reset navigation state
    resetNavigationState()

    // Add slide animation
    paymentProcess.style.opacity = "0"
    paymentProcess.style.transform = "translateX(50px)"
    setTimeout(() => {
      paymentProcess.style.opacity = "1"
      paymentProcess.style.transform = "translateX(0)"
    }, 100)
  })

  // Navigation tabs with validation
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault()
      const targetTab = this.dataset.tab

      // Check if user can access this tab
      if (!canAccessTab(targetTab)) {
        showTabError(targetTab)
        return
      }

      switchTab(targetTab)
    })
  })

  // Initialize navigation state
  resetNavigationState()
}

// Reset navigation state
function resetNavigationState() {
  // Enable only the first tab
  navTabs.forEach((tab, index) => {
    const tabName = tab.dataset.tab
    if (tabName === "amount") {
      tab.classList.remove("disabled")
      tab.classList.add("active")
    } else {
      tab.classList.add("disabled")
      tab.classList.remove("active")
    }
  })

  // Show only amount tab content
  tabContents.forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById("amountTab").classList.add("active")

  // Reset completion status
  window.tabCompletionStatus = {
    amount: false,
    details: false,
    payment: false,
  }
}

// Check if user can access a specific tab
function canAccessTab(tabName) {
  const completionStatus = window.tabCompletionStatus || {}

  switch (tabName) {
    case "amount":
      return true // Always accessible
    case "details":
      return completionStatus.amount === true
    case "payment":
      return completionStatus.amount === true && completionStatus.details === true
    default:
      return false
  }
}

// Show error when trying to access locked tab
function showTabError(tabName) {
  let message = ""

  switch (tabName) {
    case "details":
      message = "Please complete the amount selection first."
      break
    case "payment":
      if (!window.tabCompletionStatus.amount) {
        message = "Please complete the amount selection first."
      } else if (!window.tabCompletionStatus.details) {
        message = "Please complete your details first."
      }
      break
  }

  // Show error notification
  showNotification(message, "error")
}

// Updated switchTab function with completion tracking
function switchTab(tabName) {
  // Remove active class from all tabs and contents
  navTabs.forEach((tab) => tab.classList.remove("active"))
  tabContents.forEach((content) => content.classList.remove("active"))

  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
  document.getElementById(`${tabName}Tab`).classList.add("active")

  // Special handling for amount tab
  if (tabName === "amount") {
    donationForm.classList.remove("hidden")
    paymentProcess.classList.add("hidden")
  }
}

// Validate and complete amount step
function completeAmountStep() {
  if (selectedAmount === 0) {
    showNotification("Please select an amount before continuing.", "error")
    return false
  }

  // Mark amount step as completed
  window.tabCompletionStatus.amount = true

  // Enable details tab
  const detailsTab = document.querySelector('[data-tab="details"]')
  detailsTab.classList.remove("disabled")
  detailsTab.classList.add("completed")

  // Add checkmark to completed tab
  if (!detailsTab.querySelector(".checkmark")) {
    const checkmark = document.createElement("i")
    checkmark.className = "fas fa-check checkmark"
    detailsTab.appendChild(checkmark)
  }

  // Switch to details tab
  switchTab("details")
  showNotification("Amount confirmed! Please fill in your details.", "success")
  return true
}

// Validate and complete details step
function completeDetailsStep() {
  const requiredFields = ["email", "firstName", "lastName", "address", "city", "state", "zipCode", "country"]
  let isValid = true
  let firstInvalidField = null

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (!field.value.trim()) {
      field.style.borderColor = "#e74c3c"
      field.classList.add("error-shake")
      field.classList.add("invalid")
      field.classList.remove("valid")
      if (!firstInvalidField) firstInvalidField = field
      isValid = false
    } else {
      field.style.borderColor = "#27ae60"
      field.classList.remove("error-shake")
      field.classList.add("valid")
      field.classList.remove("invalid")
    }
  })

  // Email validation
  const emailField = document.getElementById("email")
  if (emailField.value && !validateEmail(emailField.value)) {
    emailField.style.borderColor = "#e74c3c"
    emailField.classList.add("error-shake")
    emailField.classList.add("invalid")
    emailField.classList.remove("valid")
    isValid = false
    if (!firstInvalidField) firstInvalidField = emailField
  }

  if (!isValid) {
    showNotification("Please fill in all required fields correctly.", "error")
    if (firstInvalidField) {
      firstInvalidField.focus()
      firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return false
  }

  // Mark details step as completed
  window.tabCompletionStatus.details = true

  // Enable payment tab
  const paymentTab = document.querySelector('[data-tab="payment"]')
  paymentTab.classList.remove("disabled")
  paymentTab.classList.add("completed")

  // Add checkmark to completed tab
  if (!paymentTab.querySelector(".checkmark")) {
    const checkmark = document.createElement("i")
    checkmark.className = "fas fa-check checkmark"
    paymentTab.appendChild(checkmark)
  }

  // Switch to payment tab
  switchTab("payment")
  showNotification("Details saved! Please enter your payment information.", "success")
  return true
}

// Show notification function
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#3498db"};
    color: white;
    border-radius: 8px;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
    font-weight: 500;
  `

  // Add icon based on type
  const icon =
    type === "success" ? "fas fa-check-circle" : type === "error" ? "fas fa-exclamation-circle" : "fas fa-info-circle"

  notification.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${message}`

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 4000)
}

// Process donation with local storage
async function processDonation() {
  // Validate form
  const requiredFields = [
    "email",
    "firstName",
    "lastName",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "cardNumber",
    "expiryDate",
    "cvv",
    "cardName",
  ]
  let isValid = true

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (!field.value.trim()) {
      field.style.borderColor = "#e74c3c"
      isValid = false
    } else {
      field.style.borderColor = "#ddd"
    }
  })

  if (!isValid) {
    showNotification("Please fill in all required fields.", "error")
    return
  }

  // Show loading
  showLoading("Processing your donation...")

  try {
    // Collect donation data
    const donationData = {
      amount: selectedAmount,
      frequency: selectedFrequency,
      email: document.getElementById("email").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      zipCode: document.getElementById("zipCode").value,
      country: document.getElementById("country").value,
      cellNumber: document.getElementById("cellNumber").value,
    }

    // Save donation to local storage
    const result = await localDB.saveDonation(donationData)

    hideLoading()

    if (result.success) {
      showNotification(
        `Thank you for your donation of $${selectedAmount}! Your contribution will help fund our Liberty Van operation.`,
        "success",
      )

      // Reset form after successful donation
      setTimeout(() => {
        resetForm()
      }, 3000)
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    hideLoading()
    console.error("Donation processing error:", error)
    showNotification("There was an error processing your donation. Please try again.", "error")
  }
}

// Reset form
function resetForm() {
  selectedAmount = 0
  selectedFrequency = "once"

  // Reset buttons
  amountButtons.forEach((btn) => btn.classList.remove("selected"))
  frequencyButtons.forEach((btn) => btn.classList.remove("active"))
  frequencyButtons[0].classList.add("active")

  // Clear inputs
  document.querySelectorAll("input").forEach((input) => {
    input.value = ""
    input.style.borderColor = "#ddd"
  })

  // Reset select
  document.getElementById("country").value = ""

  // Show donation form
  donationForm.classList.remove("hidden")
  paymentProcess.classList.add("hidden")

  // Reset tabs
  resetNavigationState()
}

// Authentication functionality with local storage
function initializeAuthentication() {
  // Form submissions
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value

      if (!email || !password) {
        showNotification("Please fill in all fields.", "error")
        return
      }

      showLoading("Signing in...")

      try {
        const result = await localDB.signIn(email, password)

        hideLoading()

        if (result.success) {
          showNotification("Login successful!", "success")
          authModal.style.display = "none"
          updateAuthUI(true, result.data.user)

          // Check if user is admin and redirect
          const isAdmin = await localDB.isAdmin(result.data.user.id)
          if (isAdmin) {
            setTimeout(() => {
              window.location.href = "admin.html"
            }, 1000)
          }
        } else {
          showNotification(result.error || "Login failed. Please try again.", "error")
        }
      } catch (error) {
        hideLoading()
        showNotification("An error occurred during login.", "error")
      }
    })
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const firstName = document.getElementById("registerFirstName").value
      const lastName = document.getElementById("registerLastName").value
      const email = document.getElementById("registerEmail").value
      const password = document.getElementById("registerPassword").value
      const confirmPassword = document.getElementById("confirmPassword").value

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification("Please fill in all fields.", "error")
        return
      }

      if (password !== confirmPassword) {
        showNotification("Passwords do not match.", "error")
        return
      }

      if (password.length < 6) {
        showNotification("Password must be at least 6 characters long.", "error")
        return
      }

      showLoading("Creating account...")

      try {
        const result = await localDB.signUp({
          firstName,
          lastName,
          email,
          password,
        })

        hideLoading()

        if (result.success) {
          showNotification("Registration successful! You can now sign in.", "success")

          // Switch to sign in form
          signUpForm.classList.add("hidden")
          signInForm.classList.remove("hidden")

          // Clear form
          registerForm.reset()
        } else {
          showNotification(result.error || "Registration failed. Please try again.", "error")
        }
      } catch (error) {
        hideLoading()
        showNotification("An error occurred during registration.", "error")
      }
    })
  }

  // Modal controls
  if (switchToSignUp) {
    switchToSignUp.addEventListener("click", (e) => {
      e.preventDefault()
      signInForm.classList.add("hidden")
      signUpForm.classList.remove("hidden")
    })
  }

  if (switchToSignIn) {
    switchToSignIn.addEventListener("click", (e) => {
      e.preventDefault()
      signUpForm.classList.add("hidden")
      signInForm.classList.remove("hidden")
    })
  }

  // Close modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      authModal.style.display = "none"
    })
  }

  window.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.style.display = "none"
    }
  })

  // Initialize auth links
  initializeAuthenticationLinks()
}

// Initialize authentication links
function initializeAuthenticationLinks() {
  const signInLink = document.getElementById("signInLink")
  const signUpLink = document.getElementById("signUpLink")

  if (signInLink) {
    signInLink.addEventListener("click", (e) => {
      e.preventDefault()
      document.getElementById("authModal").style.display = "block"
      document.getElementById("signInForm").classList.remove("hidden")
      document.getElementById("signUpForm").classList.add("hidden")
    })
  }

  if (signUpLink) {
    signUpLink.addEventListener("click", (e) => {
      e.preventDefault()
      document.getElementById("authModal").style.display = "block"
      document.getElementById("signUpForm").classList.remove("hidden")
      document.getElementById("signInForm").classList.add("hidden")
    })
  }
}

// Update authentication UI
function updateAuthUI(isSignedIn, user) {
  const authLinks = document.querySelector(".auth-links")

  if (isSignedIn && user) {
    authLinks.innerHTML = `
      <span>Welcome, ${user.firstName || "User"}</span>
      <span>|</span>
      <a href="#" id="signOutLink">Sign Out</a>
      <span>|</span>
      <a href="admin.html" id="adminLink">Dashboard</a>
    `

    // Add sign out functionality
    document.getElementById("signOutLink")?.addEventListener("click", async (e) => {
      e.preventDefault()
      const result = await localDB.signOut()
      if (result.success) {
        location.reload()
      }
    })
  } else {
    authLinks.innerHTML = `
      <a href="#" id="signInLink">Sign In</a>
      <span>|</span>
      <a href="#" id="signUpLink">Sign Up</a>
    `

    // Re-initialize auth modal listeners
    initializeAuthenticationLinks()
  }
}

// Initialize animations
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".amount-btn, .frequency-btn, .payment-btn").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "all 0.6s ease"
    observer.observe(el)
  })
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validateCardNumber(cardNumber) {
  // Basic card number validation (Luhn algorithm would be better)
  return cardNumber.replace(/\s/g, "").length >= 13
}

// Add input formatting
document.addEventListener("DOMContentLoaded", () => {
  // Format card number input
  const cardNumberInput = document.getElementById("cardNumber")
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function () {
      const value = this.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
      const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
      this.value = formattedValue
    })
  }

  // Format expiry date input
  const expiryInput = document.getElementById("expiryDate")
  if (expiryInput) {
    expiryInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }
      this.value = value
    })
  }
})

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .error-shake {
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  }

  .loading-spinner {
    background: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .loading-spinner i {
    font-size: 2rem;
    color: #ff6b6b;
    margin-bottom: 15px;
  }

  .loading-spinner p {
    margin: 0;
    font-weight: 500;
    color: #333;
  }

  .hidden {
    display: none !important;
  }
`
document.head.appendChild(style)

// Demo credentials info
console.log("🎯 DEMO CREDENTIALS:")
console.log("Admin Login: admin@demo.com / admin123")
console.log("💳 Test Card: 4242 4242 4242 4242")
console.log("📅 Expiry: 12/25, CVV: 123")
