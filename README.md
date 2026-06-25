# Medineva PMS (Patient Management System)

A modern, comprehensive, and state-of-the-art clinic management solution designed specifically for medical and healthcare professionals. This application streamlines patient workflows, scheduling, billing, and clinical record-keeping with a premium, responsive UI.

## Key Features

### Dynamic Dashboard
- **Real-time Analytics**: Stay updated with patient growth, revenue trends, and appointment statistics.
- **Upcoming Schedule**: Quick view of daily and weekly appointments.
- **Recent Activity**: Track the latest updates across the clinic.

###  Patient Management
- **Centralized Records**: Manage patient profiles, medical history, and contact details.
- **Bulk Import/Export**: seamless migration with CSV support and duplicate detection (by phone number).
- **Service History**: Track treatments and procedures for every patient.

### Advanced Scheduler
- **Interactive Calendar**: Premium day/week views with intuitive navigation.
- **Smart Working Hours**: Auto-filtered time slots (8 AM - 8 PM) with 24-hour expansion.
- **Auto-Scroll**: Automatically centers on the current time for busy practitioners.

### Billing & Invoicing
- **Automated Invoices**: Generate invoices directly from clinical procedures.
- **Payment Tracking**: Record payments via Cash, Card, UPI, and Bank Transfer.
- **PDF Generation**: Professional invoices ready for print or digital sharing.

### Clinic Settings
- **Treatment Catalog**: Customize your services, categories, and standard pricing.
- **Role-Based Access**: Secure management of doctors and administrative staff.

## Tech Stack

- **Framework**: [Next.js 14/15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Auth/Clerk](https://clerk.com/)
- **Date Management**: [date-fns](https://date-fns.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

##  Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anantdadhich/pms.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-key"
   CLERK_SECRET_KEY="your-key"
   ```

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your local instance.

## Project Structure

```text
src/
│── app/             # Next.js App Router (Pages & API)
├── components/      # Reusable UI components
│   ├── ui/         # Base Shadcn/UI components
│   ├── dashboard/  # Dashboard specific charts & cards
│   ├── patients/   # Patient forms & tables
│   └── schedule/   # Calendar & appointment logic
├── lib/             # Utilities and Server Actions
│   ├── actions/    # Backend logic (Prisma queries)
│   ├── validations/# Zod schemas
│   └── utils.ts    # Formatting & helpers
└── prisma/          # Database schema
```

## License

Individual/Commercial license as per project terms.

---
Built with ❤️ for Clinical Excellence.
