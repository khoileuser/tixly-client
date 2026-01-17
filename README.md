# Tixly Client - Event Ticketing Platform

A modern event ticketing platform built with Next.js, designed for static deployment on AWS S3.

## Getting Started

### Development

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This client application is automatically deployed to AWS S3 as a static website when the [tixly-server](https://github.com/khoileuser/tixly-server) workflow completes successfully.

### Automatic Deployment

The client deployment workflow is **automatically triggered** by the server repository's infrastructure workflow after a successful deployment. When triggered automatically:

-   AWS credentials are automatically configured from server workflow
-   `NEXT_PUBLIC_API_URL` is automatically set to the deployed backend URL
-   `S3_BUCKET_NAME` is automatically populated from CloudFormation outputs
-   No manual configuration required

**Trigger conditions:**

-   Server infrastructure is deployed or updated
-   Server backend is deployed successfully
-   The server workflow calls this client workflow with all necessary credentials

### Manual Deployment

You can also manually trigger the deployment workflow if needed (e.g., for client-only changes).

#### Prerequisites

Set up the following GitHub secrets in your repository settings (`Settings` → `Secrets and variables` → `Actions`):

**Repository Secrets:**

-   `AWS_ACCESS_KEY_ID` - Your AWS access key ID
-   `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key
-   `AWS_SESSION_TOKEN` - (Optional) AWS session token if using temporary credentials

**Repository Variables:**

-   `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://api.yourdomain.com`)
-   `S3_BUCKET_NAME` - S3 bucket name for static website hosting (e.g., `yourdomain.com`)

#### Triggering Manual Deployment

1. **Option 1: Push to Main Branch**

    ```bash
    git add .
    git commit -m "Update client"
    git push origin main
    ```

2. **Option 2: GitHub UI (Workflow Dispatch)**
    - Go to `Actions` tab in your repository
    - Select the deployment workflow
    - Click `Run workflow`
    - Select `main` branch
    - Click `Run workflow` button

## Project Structure

```
tixly-client/
├── .env.example        # Example environment variables
├── .github/            # GitHub workflows and configs
├── .gitignore
├── components.json     # shadcn/ui configuration
├── eslint.config.mjs   # ESLint configuration
├── next-env.d.ts       # Next.js TypeScript declarations
├── next.config.ts      # Next.js configuration
├── package.json        # Node.js dependencies
├── postcss.config.mjs  # PostCSS configuration
├── tsconfig.json       # TypeScript configuration
├── README.md           # This file
├── app/                # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── admin/          # Admin pages
│   │   ├── analytics/  # Analytics dashboard
│   │   │   └── page.tsx
│   │   └── events/     # Event management
│   │       └── page.tsx
│   ├── booking/        # Booking flow
│   │   ├── BookingClient.tsx  # Client-side booking component
│   │   └── page.tsx    # Booking page
│   ├── events/         # Event pages
│   │   ├── EventDetailClientPage.tsx  # Event details component
│   │   └── page.tsx    # Events listing
│   ├── forgot-password/  # Password reset
│   │   └── page.tsx
│   ├── login/          # Login page
│   │   └── page.tsx
│   ├── profile/        # User profile
│   │   └── page.tsx
│   └── register/       # Registration page
│       └── page.tsx
├── components/         # React components
│   ├── navbar.tsx      # Navigation bar
│   ├── booking-timer.tsx  # Booking countdown timer
│   ├── category-management-dialog.tsx  # Category CRUD dialog
│   ├── event-form-dialog.tsx  # Event create/edit dialog
│   └── ui/             # shadcn/ui components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── interfaces/         # TypeScript interfaces
│   ├── index.ts        # Interface exports
│   ├── analytics.interfaces.ts  # Analytics types
│   ├── auth.interfaces.ts       # Authentication types
│   ├── booking.interfaces.ts    # Booking types
│   ├── category.interfaces.ts   # Category types
│   └── event.interfaces.ts      # Event types
├── lib/                # Utility functions
│   ├── auth.ts         # Authentication helpers
│   ├── booking.ts      # Booking helpers
│   └── utils.ts        # General utilities
└── public/             # Static assets
    └── (images, icons, etc.)
```
