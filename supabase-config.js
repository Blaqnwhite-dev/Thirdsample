// Supabase configuration - Anonymous setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Database helper functions
class DatabaseManager {
  constructor() {
    this.supabase = supabase
  }

  // User authentication
  async signUp(userData) {
    try {
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
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: error.message }
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()
      if (error) throw error
      return { success: true, user }
    } catch (error) {
      console.error("Get user error:", error)
      return { success: false, error: error.message }
    }
  }

  // Donation management
  async saveDonation(donationData) {
    try {
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
    } catch (error) {
      console.error("Save donation error:", error)
      return { success: false, error: error.message }
    }
  }

  async getDonations(limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error("Get donations error:", error)
      return { success: false, error: error.message }
    }
  }

  async getDonationStats() {
    try {
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
      const { data, error } = await this.supabase.from("user_profiles").select("role").eq("user_id", userId).single()

      if (error) throw error
      return data?.role === "admin"
    } catch (error) {
      console.error("Check admin error:", error)
      return false
    }
  }

  async createUserProfile(userId, userData) {
    try {
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
    } catch (error) {
      console.error("Create user profile error:", error)
      return { success: false, error: error.message }
    }
  }
}

// Initialize database manager
const db = new DatabaseManager()

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    console.log("User signed in")
    updateAuthUI(true, session.user)
  } else if (event === "SIGNED_OUT") {
    console.log("User signed out")
    updateAuthUI(false, null)
  }
})

// Update authentication UI
function updateAuthUI(isSignedIn, user) {
  const authLinks = document.querySelector(".auth-links")

  if (isSignedIn && user) {
    authLinks.innerHTML = `
      <span>Welcome, ${user.user_metadata?.first_name || "User"}</span>
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
})
