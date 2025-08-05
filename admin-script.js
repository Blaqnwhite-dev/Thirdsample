// Admin Dashboard JavaScript with Supabase Integration
const db = {} // Declare the db variable here

document.addEventListener("DOMContentLoaded", () => {
  initializeSidebar()
  initializeNavigation()
  initializeMobileMenu()
  checkAdminAccess()
  loadDashboardData()
})

// Check if user has admin access
async function checkAdminAccess() {
  try {
    const { user } = await db.getCurrentUser()

    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "index.html"
      return
    }

    // Check if user is admin
    const isAdmin = await db.isAdmin(user.id)
    if (!isAdmin) {
      alert("Access denied. Admin privileges required.")
      window.location.href = "index.html"
      return
    }

    // Update admin name in header
    const adminName = document.getElementById("adminName")
    if (adminName) {
      adminName.textContent = user.user_metadata?.first_name || "Administrator"
    }
  } catch (error) {
    console.error("Admin access check failed:", error)
    window.location.href = "index.html"
  }
}

// Sidebar functionality
function initializeSidebar() {
  const navItems = document.querySelectorAll(".nav-item")
  const contentSections = document.querySelectorAll(".content-section")

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Skip if it's a logout or external link
      if (this.id === "logoutBtn" || this.href) {
        return
      }

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Hide all content sections
      contentSections.forEach((section) => section.classList.remove("active"))

      // Show selected section
      const targetSection = this.dataset.section + "Section"
      const section = document.getElementById(targetSection)
      if (section) {
        section.classList.add("active")

        // Update page title
        const pageTitle = document.getElementById("pageTitle")
        if (pageTitle) {
          pageTitle.textContent = this.dataset.section.charAt(0).toUpperCase() + this.dataset.section.slice(1)
        }

        // Load section-specific data
        loadSectionData(this.dataset.section)
      }

      // Add click animation
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault()

      if (confirm("Are you sure you want to logout?")) {
        showLoading("Signing out...")
        const result = await db.signOut()
        hideLoading()

        if (result.success) {
          window.location.href = "index.html"
        } else {
          alert("Error signing out. Please try again.")
        }
      }
    })
  }
}

// Navigation functionality
function initializeNavigation() {
  // Add smooth transitions
  const contentSections = document.querySelectorAll(".content-section")
  contentSections.forEach((section) => {
    section.style.transition = "all 0.3s ease"
  })
}

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const sidebar = document.getElementById("sidebar")

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active")

      // Add overlay for mobile
      if (sidebar.classList.contains("active")) {
        const overlay = document.createElement("div")
        overlay.className = "sidebar-overlay"
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        `
        document.body.appendChild(overlay)

        overlay.addEventListener("click", () => {
          sidebar.classList.remove("active")
          document.body.removeChild(overlay)
        })
      }
    })
  }
}

// Load section-specific data
async function loadSectionData(section) {
  switch (section) {
    case "donations":
      await loadDonationsData()
      break
    case "donors":
      await loadDonorsData()
      break
    case "campaigns":
      await loadCampaignsData()
      break
    default:
      break
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    showLoading("Loading dashboard data...")

    // Get donation statistics
    const statsResult = await db.getDonationStats()

    if (statsResult.success) {
      const stats = statsResult.stats

      // Update stat cards
      document.getElementById("totalRaised").textContent = `$${stats.totalRaised.toLocaleString()}`
      document.getElementById("totalDonors").textContent = stats.totalDonors.toLocaleString()
      document.getElementById("todaysDonations").textContent = stats.todaysDonations.toLocaleString()

      // Calculate goal progress
      const goalAmount = 1000000 // $1M goal
      const progressPercentage = Math.min((stats.totalRaised / goalAmount) * 100, 100)
      document.getElementById("goalProgress").textContent = `${progressPercentage.toFixed(1)}%`

      // Update campaign progress
      const campaignRaised = document.getElementById("campaignRaised")
      const campaignProgress = document.getElementById("campaignProgress")
      if (campaignRaised) campaignRaised.textContent = stats.totalRaised.toLocaleString()
      if (campaignProgress) campaignProgress.style.width = `${progressPercentage}%`

      // Animate counters
      animateCounters()
    }

    // Load recent activity
    await loadRecentActivity()

    hideLoading()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    hideLoading()
    showNotification("Error loading dashboard data", "error")
  }
}

// Load recent activity
async function loadRecentActivity() {
  try {
    const donationsResult = await db.getDonations(10) // Get last 10 donations

    if (donationsResult.success) {
      const activityList = document.getElementById("activityList")
      if (activityList) {
        activityList.innerHTML = ""

        donationsResult.data.forEach((donation, index) => {
          const timeAgo = getTimeAgo(new Date(donation.created_at))
          const activityItem = document.createElement("div")
          activityItem.className = "activity-item"
          activityItem.style.opacity = "0"
          activityItem.style.transform = "translateX(-20px)"

          activityItem.innerHTML = `
            <div class="activity-icon">
              <i class="fas fa-donate"></i>
            </div>
            <div class="activity-details">
              <p><strong>New donation received</strong></p>
              <span>$${donation.amount} from ${donation.donor_first_name} ${donation.donor_last_name.charAt(0)}. - ${timeAgo}</span>
            </div>
          `

          activityList.appendChild(activityItem)

          // Animate in
          setTimeout(() => {
            activityItem.style.transition = "all 0.4s ease"
            activityItem.style.opacity = "1"
            activityItem.style.transform = "translateX(0)"
          }, index * 100)
        })
      }
    }
  } catch (error) {
    console.error("Error loading recent activity:", error)
  }
}

// Load donations data
async function loadDonationsData() {
  try {
    const tableBody = document.getElementById("donationsTableBody")
    if (!tableBody) return

    tableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Loading donations...</td></tr>'

    const donationsResult = await db.getDonations(100)

    if (donationsResult.success) {
      tableBody.innerHTML = ""

      donationsResult.data.forEach((donation) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${new Date(donation.created_at).toLocaleDateString()}</td>
          <td>${donation.donor_first_name} ${donation.donor_last_name}</td>
          <td>$${donation.amount}</td>
          <td>${donation.frequency}</td>
          <td><span class="status ${donation.status}">${donation.status}</span></td>
          <td>
            <button class="btn btn-small" onclick="viewDonation('${donation.id}')">View</button>
          </td>
        `
        tableBody.appendChild(row)
      })
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Error loading donations</td></tr>'
    }
  } catch (error) {
    console.error("Error loading donations:", error)
    const tableBody = document.getElementById("donationsTableBody")
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Error loading donations</td></tr>'
    }
  }
}

// Load donors data
async function loadDonorsData() {
  try {
    const donorsGrid = document.getElementById("donorsGrid")
    if (!donorsGrid) return

    donorsGrid.innerHTML = '<div class="loading-message">Loading donors...</div>'

    const donationsResult = await db.getDonations(1000)

    if (donationsResult.success) {
      // Group donations by donor email
      const donorMap = new Map()

      donationsResult.data.forEach((donation) => {
        const email = donation.donor_email
        if (donorMap.has(email)) {
          const existing = donorMap.get(email)
          existing.totalDonated += donation.amount
          existing.donationCount += 1
          existing.lastDonation =
            new Date(donation.created_at) > new Date(existing.lastDonation)
              ? donation.created_at
              : existing.lastDonation
        } else {
          donorMap.set(email, {
            firstName: donation.donor_first_name,
            lastName: donation.donor_last_name,
            email: email,
            totalDonated: donation.amount,
            donationCount: 1,
            lastDonation: donation.created_at,
          })
        }
      })

      donorsGrid.innerHTML = ""

      Array.from(donorMap.values()).forEach((donor) => {
        const donorCard = document.createElement("div")
        donorCard.className = "donor-card"

        const initials = `${donor.firstName.charAt(0)}${donor.lastName.charAt(0)}`
        const lastDonationDate = new Date(donor.lastDonation).toLocaleDateString()

        donorCard.innerHTML = `
          <div class="donor-header">
            <div class="donor-avatar">${initials}</div>
            <div class="donor-info">
              <h4>${donor.firstName} ${donor.lastName}</h4>
              <p>${donor.email}</p>
            </div>
          </div>
          <div class="donor-stats">
            <div class="donor-stat">
              <strong>$${donor.totalDonated.toLocaleString()}</strong>
              <span>Total Donated</span>
            </div>
            <div class="donor-stat">
              <strong>${donor.donationCount}</strong>
              <span>Donations</span>
            </div>
            <div class="donor-stat">
              <strong>${lastDonationDate}</strong>
              <span>Last Donation</span>
            </div>
          </div>
        `

        donorsGrid.appendChild(donorCard)
      })
    } else {
      donorsGrid.innerHTML = '<div class="loading-message">Error loading donors</div>'
    }
  } catch (error) {
    console.error("Error loading donors:", error)
    const donorsGrid = document.getElementById("donorsGrid")
    if (donorsGrid) {
      donorsGrid.innerHTML = '<div class="loading-message">Error loading donors</div>'
    }
  }
}

// Load campaigns data
async function loadCampaignsData() {
  // Campaign data is mostly static for now
  // In a real app, this would load from the campaigns table
}

// Animate counter numbers
function animateCounters() {
  const counters = document.querySelectorAll(".stat-info h3")

  counters.forEach((counter) => {
    const target = counter.textContent
    const numericValue = Number.parseInt(target.replace(/[^0-9]/g, ""))

    if (numericValue) {
      let current = 0
      const increment = numericValue / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= numericValue) {
          current = numericValue
          clearInterval(timer)
        }

        if (target.includes("$")) {
          counter.textContent = "$" + Math.floor(current).toLocaleString()
        } else if (target.includes("%")) {
          counter.textContent = Math.floor(current) + "%"
        } else {
          counter.textContent = Math.floor(current).toLocaleString()
        }
      }, 20)
    }
  })
}

// Export functions
async function exportDonations() {
  try {
    showLoading("Exporting donations...")

    const donationsResult = await db.getDonations(10000) // Get all donations

    if (donationsResult.success) {
      const csvContent = generateDonationsCSV(donationsResult.data)
      downloadCSV(csvContent, "donations.csv")
      showNotification("Donations exported successfully!", "success")
    } else {
      throw new Error("Failed to fetch donations")
    }

    hideLoading()
  } catch (error) {
    console.error("Export error:", error)
    hideLoading()
    showNotification("Error exporting donations", "error")
  }
}

async function exportDonors() {
  try {
    showLoading("Exporting donors...")

    const donationsResult = await db.getDonations(10000)

    if (donationsResult.success) {
      // Group by donor email to get unique donors
      const donorMap = new Map()

      donationsResult.data.forEach((donation) => {
        const email = donation.donor_email
        if (!donorMap.has(email)) {
          donorMap.set(email, {
            firstName: donation.donor_first_name,
            lastName: donation.donor_last_name,
            email: email,
            address: donation.donor_address,
            city: donation.donor_city,
            state: donation.donor_state,
            zipCode: donation.donor_zip_code,
            country: donation.donor_country,
            phone: donation.donor_phone,
            totalDonated: donation.amount,
            donationCount: 1,
            firstDonation: donation.created_at,
            lastDonation: donation.created_at,
          })
        } else {
          const existing = donorMap.get(email)
          existing.totalDonated += donation.amount
          existing.donationCount += 1
          if (new Date(donation.created_at) < new Date(existing.firstDonation)) {
            existing.firstDonation = donation.created_at
          }
          if (new Date(donation.created_at) > new Date(existing.lastDonation)) {
            existing.lastDonation = donation.created_at
          }
        }
      })

      const csvContent = generateDonorsCSV(Array.from(donorMap.values()))
      downloadCSV(csvContent, "donors.csv")
      showNotification("Donors exported successfully!", "success")
    } else {
      throw new Error("Failed to fetch donor data")
    }

    hideLoading()
  } catch (error) {
    console.error("Export donors error:", error)
    hideLoading()
    showNotification("Error exporting donors", "error")
  }
}

function generateReport() {
  showNotification("Report generation feature coming soon!", "info")
}

function createCampaign() {
  showNotification("Campaign creation feature coming soon!", "info")
}

function viewDonation(donationId) {
  showNotification(`Viewing donation ${donationId}`, "info")
}

// CSV generation functions
function generateDonationsCSV(donations) {
  const headers = [
    "Date",
    "Transaction ID",
    "Donor First Name",
    "Donor Last Name",
    "Email",
    "Amount",
    "Frequency",
    "Address",
    "City",
    "State",
    "Zip Code",
    "Country",
    "Phone",
    "Status",
  ]

  const csvRows = [headers.join(",")]

  donations.forEach((donation) => {
    const row = [
      new Date(donation.created_at).toLocaleDateString(),
      donation.transaction_id,
      donation.donor_first_name,
      donation.donor_last_name,
      donation.donor_email,
      donation.amount,
      donation.frequency,
      donation.donor_address,
      donation.donor_city,
      donation.donor_state,
      donation.donor_zip_code,
      donation.donor_country,
      donation.donor_phone || "",
      donation.status,
    ]
    csvRows.push(row.map((field) => `"${field}"`).join(","))
  })

  return csvRows.join("\n")
}

function generateDonorsCSV(donors) {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Address",
    "City",
    "State",
    "Zip Code",
    "Country",
    "Phone",
    "Total Donated",
    "Donation Count",
    "First Donation",
    "Last Donation",
  ]

  const csvRows = [headers.join(",")]

  donors.forEach((donor) => {
    const row = [
      donor.firstName,
      donor.lastName,
      donor.email,
      donor.address,
      donor.city,
      donor.state,
      donor.zipCode,
      donor.country,
      donor.phone || "",
      donor.totalDonated,
      donor.donationCount,
      new Date(donor.firstDonation).toLocaleDateString(),
      new Date(donor.lastDonation).toLocaleDateString(),
    ]
    csvRows.push(row.map((field) => `"${field}"`).join(","))
  })

  return csvRows.join("\n")
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Utility functions
function getTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}

function showLoading(message = "Loading...") {
  const overlay = document.getElementById("loadingOverlay")
  const text = overlay.querySelector("p")
  text.textContent = message
  overlay.classList.remove("hidden")
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden")
}

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

// Responsive handling
function handleResize() {
  const sidebar = document.getElementById("sidebar")

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active")
    // Remove any existing overlays
    const overlay = document.querySelector(".sidebar-overlay")
    if (overlay) {
      document.body.removeChild(overlay)
    }
  }
}

window.addEventListener("resize", handleResize)

// Add CSS animations
const notificationStyles = document.createElement("style")
notificationStyles.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .status.completed {
    background: #d4edda;
    color: #155724;
  }

  .status.pending {
    background: #fff3cd;
    color: #856404;
  }

  .status.failed {
    background: #f8d7da;
    color: #721c24;
  }
`
document.head.appendChild(notificationStyles)
