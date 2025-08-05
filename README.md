# Save America Movement - Donation Platform

An anonymous donation platform built for political fundraising with complete privacy protection.

## Features

### 🎯 **Donation System**
- Multiple payment options (Card, PayPal, Google Pay)
- One-time and recurring donations
- Real-time form validation
- Secure payment processing simulation

### 🔐 **Authentication & Privacy**
- Anonymous user registration
- Secure login system
- No tracking or analytics
- Privacy-focused design

### 📊 **Admin Dashboard**
- Real-time donation statistics
- Donor management
- Campaign tracking
- Data export capabilities
- Mobile responsive interface

### 🛡️ **Security Features**
- Row Level Security (RLS) with Supabase
- Encrypted data storage
- Anonymous developer identity
- No personal information exposure

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome 6
- **Deployment**: Vercel (recommended)

## Database Schema

### Tables
- `user_profiles` - User account information
- `donations` - Donation records and details
- `campaigns` - Fundraising campaigns

### Security
- Row Level Security enabled on all tables
- Admin-only access to sensitive data
- Automatic user profile creation on signup

## Setup Instructions

### 1. Supabase Configuration
1. Create a new Supabase project
2. Run the SQL script from `scripts/create-tables.sql`
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 3. Admin Access
1. Register a new account
2. Manually update the user's role to 'admin' in the database
3. Access admin dashboard at `/admin.html`

## Privacy & Anonymity

This platform is designed with complete anonymity in mind:

- No developer identification in code
- No tracking scripts or analytics
- Minimal data collection
- Secure, encrypted storage
- Anonymous deployment possible

## File Structure

\`\`\`
├── index.html              # Main donation page
├── admin.html              # Admin dashboard
├── styles.css              # Main stylesheet
├── admin-styles.css        # Admin dashboard styles
├── script.js               # Main application logic
├── admin-script.js         # Admin dashboard logic
├── supabase-config.js      # Database configuration
├── scripts/
│   └── create-tables.sql   # Database schema
└── README.md               # This file
\`\`\`

## Features in Detail

### Donation Flow
1. **Amount Selection**: Predefined amounts or custom input
2. **Frequency Choice**: One-time or monthly recurring
3. **Payment Method**: Card, PayPal, or Google Pay options
4. **Step-by-Step Process**: Amount → Details → Payment
5. **Form Validation**: Real-time validation with visual feedback

### Admin Dashboard
1. **Statistics Overview**: Total raised, donor count, goal progress
2. **Donation Management**: View, filter, and export donations
3. **Donor Analytics**: Donor profiles and giving patterns
4. **Campaign Tracking**: Monitor fundraising progress
5. **Data Export**: CSV export for donations and donors

### Security Measures
1. **Authentication**: Supabase Auth with email verification
2. **Authorization**: Role-based access control
3. **Data Protection**: Row Level Security policies
4. **Privacy**: No unnecessary data collection

## Customization

### Branding
- Update SVG logo in `index.html`
- Modify color scheme in CSS files
- Change organization details in footer

### Functionality
- Add new payment processors
- Implement email notifications
- Add more reporting features
- Integrate with CRM systems

## Support

This is an anonymous project. For technical issues:
1. Check browser console for errors
2. Verify Supabase configuration
3. Ensure environment variables are set correctly
4. Test database connectivity

## Legal Compliance

Ensure compliance with:
- Campaign finance laws
- Data protection regulations (GDPR, CCPA)
- Payment processing requirements
- Tax reporting obligations

## License

MIT License - Use freely while maintaining anonymity.

---

**Note**: This platform is designed for legitimate political fundraising activities. Ensure compliance with all applicable laws and regulations in your jurisdiction.
