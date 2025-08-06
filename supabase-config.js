// Supabase configuration - Fixed for static HTML
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'

// For development/testing, you can temporarily use these placeholder values
// const SUPABASE_URL = 'https://your-project.supabase.co'
// const SUPABASE_ANON_KEY = 'your-anon-key-here'

// Initialize Supabase client with error handling
let supabase = null
let isSupabaseConnected = false

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && 
      SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
      SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    isSupabaseConnected = true
    console.log('✅ Supabase connected successfully')
  } else {
    console.warn('⚠️ Supabase credentials not configured. Using demo mode.')
    isSupabaseConnected = false
  }
} catch (error) {
  console.error('❌ Supabase connection failed:', error)
  isSupabaseConnected = false
}

// Database helper functions with fallback to demo mode
class DatabaseManager {
  constructor() {
    this.supabase = supabase
    this.isConnected = isSupabaseConnected
    
    // Demo data for when Supabase isn't connected
    this.demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]')
    this.demoDonations = JSON.parse(localStorage.getItem('demo_donations') || '[]')
    this.currentUser = JSON.parse(localStorage.getItem('demo_current_user') || 'null')
    
    // Initialize demo data if empty
    this.initializeDemoData()
  }

  initializeDemoData() {
    if (this.demoUsers.length === 0) {
      this.demoUsers = [
        {
          id: 1,
          email: 'admin@demo.com',
          password: 'admin123',
          user_metadata: {
            first_name: 'Admin',
            last_name: 'User',
            full_name: 'Admin User',
            role: 'admin'
          }
        }
      ]
      localStorage.setItem('demo_users', JSON.stringify(this.demoUsers))
    }

    if (this.demoDonations.length === 0) {
      this.demoDonations = [
        {
          id: 1,
          amount: 250,
          frequency: 'once',
          donor_email: 'john.doe@email.com',
          donor_first_name: 'John',
          donor_last_name: 'Doe',
          donor_address: '123 Main St',
          donor_city: 'Anytown',
          donor_state: 'CA',
          donor_zip_code: '12345',
          donor_country: 'US',
          donor_phone: '555-0123',
          payment_method: 'card',
          status: 'completed',
          transaction_id: 'TXN_DEMO_001',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          amount: 100,
          frequency: 'monthly',
          donor_email: 'sarah.smith@email.com',
          donor_first_name: 'Sarah',
          donor_last_name: 'Smith',
          donor_address: '456 Oak Ave',
          donor_city: 'Springfield',
          donor_state: 'NY',
          donor_zip_code: '67890',
          donor_country: 'US',
          donor_phone: '555-0456',
          payment_method: 'card',
          status: 'completed',
          transaction_id: 'TXN_DEMO_002',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      localStorage.setItem('demo_donations', JSON.stringify(this.demoDonations))
    }
  }

  // User authentication
  async signUp(userData) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              full_name: `${userData.firstName} ${userData.lastName}`,
              role: "user",
            },
          },
        })

        if (error) throw error
        return { success: true, data }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (this.demoUsers.find(u => u.email === userData.email)) {
          return { success: false, error: 'User already exists' }
        }
        
        const user = {
          id: Date.now(),
          email: userData.email,
          password: userData.password,
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
            role: 'user'
          }
        }
        
        this.demoUsers.push(user)
        localStorage.setItem('demo_users', JSON.stringify(this.demoUsers))
        return { success: true, data: { user } }
      }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: error.message }
    }
  }

  async signIn(email, password) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        return { success: true, data }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const user = this.demoUsers.find(u => u.email === email && u.password === password)
        if (user) {
          this.currentUser = user
          localStorage.setItem('demo_current_user', JSON.stringify(user))
          return { success: true, data: { user } }
        }
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  async signOut() {
    try {
      if (this.isConnected) {
        const { error } = await this.supabase.auth.signOut()
        if (error) throw error
        return { success: true }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        this.currentUser = null
        localStorage.removeItem('demo_current_user')
        return { success: true }
      }
    } catch (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser() {
    try {
      if (this.isConnected) {
        const {
          data: { user },
          error,
        } = await this.supabase.auth.getUser()
        if (error) throw error
        return { success: true, user }
      } else {
        // Demo mode
        return { success: true, user: this.currentUser }
      }
    } catch (error) {
      console.error("Get user error:", error)
      return { success: false, error: error.message }
    }
  }

  // Donation management
  async saveDonation(donationData) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase
          .from("donations")
          .insert([
            {
              amount: donationData.amount,
              frequency: donationData.frequency,
              donor_email: donationData.email,
              donor_first_name: donationData.firstName,
              donor_last_name: donationData.lastName,
              donor_address: donationData.address,
              donor_city: donationData.city,
              donor_state: donationData.state,
              donor_zip_code: donationData.zipCode,
              donor_country: donationData.country,
              donor_phone: donationData.cellNumber || null,
              payment_method: "card",
              status: "completed",
              transaction_id: this.generateTransactionId(),
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) throw error
        return { success: true, data }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const donation = {
          id: Date.now(),
          amount: donationData.amount,
          frequency: donationData.frequency,
          donor_email: donationData.email,
          donor_first_name: donationData.firstName,
          donor_last_name: donationData.lastName,
          donor_address: donationData.address,
          donor_city: donationData.city,
          donor_state: donationData.state,
          donor_zip_code: donationData.zipCode,
          donor_country: donationData.country,
          donor_phone: donationData.cellNumber || null,
          payment_method: "card",
          status: "completed",
          transaction_id: this.generateTransactionId(),
          created_at: new Date().toISOString(),
        }
        
        this.demoDonations.push(donation)
        localStorage.setItem('demo_donations', JSON.stringify(this.demoDonations))
        return { success: true, data: [donation] }
      }
    } catch (error) {
      console.error("Save donation error:", error)
      return { success: false, error: error.message }
    }
  }

  async getDonations(limit = 50) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase
          .from("donations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error
        return { success: true, data }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 300))
        const sortedDonations = [...this.demoDonations]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit)
        return { success: true, data: sortedDonations }
      }
    } catch (error) {
      console.error("Get donations error:", error)
      return { success: false, error: error.message }
    }
  }

  async getDonationStats() {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase.from("donations").select("amount, frequency, created_at")

        if (error) throw error

        const stats = {
          totalRaised: data.reduce((sum, donation) => sum + donation.amount, 0),
          totalDonors: data.length,
          todaysDonations: data.filter((d) => {
            const today = new Date().toDateString()
            const donationDate = new Date(d.created_at).toDateString()
            return today === donationDate
          }).length,
          monthlyDonors: data.filter((d) => d.frequency === "monthly").length,
        }

        return { success: true, stats }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 400))
        
        const stats = {
          totalRaised: this.demoDonations.reduce((sum, donation) => sum + donation.amount, 0),
          totalDonors: new Set(this.demoDonations.map(d => d.donor_email)).size,
          todaysDonations: this.demoDonations.filter((d) => {
            const today = new Date().toDateString()
            const donationDate = new Date(d.created_at).toDateString()
            return today === donationDate
          }).length,
          monthlyDonors: this.demoDonations.filter((d) => d.frequency === "monthly").length,
        }

        return { success: true, stats }
      }
    } catch (error) {
      console.error("Get donation stats error:", error)
      return { success: false, error: error.message }
    }
  }

  // Utility functions
  generateTransactionId() {
    return "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  // Admin functions
  async isAdmin(userId) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase.from("user_profiles").select("role").eq("user_id", userId).single()

        if (error) throw error
        return data?.role === "admin"
      } else {
        // Demo mode
        const user = this.demoUsers.find(u => u.id === userId)
        return user?.user_metadata?.role === "admin"
      }
    } catch (error) {
      console.error("Check admin error:", error)
      return false
    }
  }

  async createUserProfile(userId, userData) {
    try {
      if (this.isConnected) {
        const { data, error } = await this.supabase
          .from("user_profiles")
          .insert([
            {
              user_id: userId,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              role: "user",
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) throw error
        return { success: true, data }
      } else {
        // Demo mode - profiles are handled in user_metadata
        return { success: true, data: [] }
      }
    } catch (error) {
      console.error("Create user profile error:", error)
      return { success: false, error: error.message }
    }
  }
}

// Initialize database manager
const db = new DatabaseManager()

// Make db available globally for admin dashboard
window.db = db;

// Also make it available for the main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = db;
}

// Auth state listener (only if Supabase is connected)
if (isSupabaseConnected && supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      console.log("User signed in")
      updateAuthUI(true, session.user)
    } else if (event === "SIGNED_OUT") {
      console.log("User signed out")
      updateAuthUI(false, null)
    }
  })
}

// Update authentication UI
function updateAuthUI(isSignedIn, user) {
  const authLinks = document.querySelector(".auth-links")

  if (isSignedIn && user) {
    const firstName = user.user_metadata?.first_name || user.first_name || "User"
    authLinks.innerHTML = `
      <span>Welcome, ${firstName}</span>
      <span>|</span>
      <a href="#" id="signOutLink">Sign Out</a>
      <span>|</span>
      <a href="admin.html" id="adminLink">Dashboard</a>
    `

    // Add sign out functionality
    document.getElementById("signOutLink")?.addEventListener("click", async (e) => {
      e.preventDefault()
      const result = await db.signOut()
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
    initializeAuthenticationListeners()
  }
}

// Initialize authentication listeners
function initializeAuthenticationListeners() {
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

// Check initial auth state
document.addEventListener("DOMContentLoaded", async () => {
  const { user } = await db.getCurrentUser()
  if (user) {
    updateAuthUI(true, user)
  }
  
  // Show connection status
  const statusDiv = document.createElement('div')
  statusDiv.style.cssText = `
    position: fixed; 
    top: 10px; 
    left: 10px; 
    background: ${isSupabaseConnected ? '#27ae60' : '#f39c12'}; 
    color: white; 
    padding: 8px 12px; 
    border-radius: 5px; 
    font-size: 12px; 
    z-index: 1000;
    font-weight: bold;
  `
  statusDiv.textContent = isSupabaseConnected ? '✅ Supabase Connected' : '⚠️ Demo Mode (No Supabase)'
  document.body.appendChild(statusDiv)
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (statusDiv.parentNode) {
      statusDiv.parentNode.removeChild(statusDiv)
    }
  }, 5000)
})
