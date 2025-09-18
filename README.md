# BeanHealth - Healthcare Management Platform<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

BeanHealth is a comprehensive healthcare management platform built with React, TypeScript, and Supabase. It provides separate portals for patients and doctors with features like health tracking, medical record management, secure messaging, and AI-powered health summaries.</div>



## Features# Run and deploy your AI Studio app



### For PatientsThis contains everything you need to run your app locally.

- 📊 **Health Dashboard** - Track vitals (blood pressure, heart rate, temperature)

- 💊 **Medication Management** - Add, edit, and track medicationsView your app in AI Studio: https://ai.studio/apps/drive/1V0UYZGg5huuyPt6SlKqUrGUdYZ0TvIkR

- 📄 **Medical Records** - Upload and organize medical documents with AI analysis

- 💬 **Secure Messaging** - Chat with your doctors, send urgent messages## Run Locally

- 📈 **Progress Tracking** - View health trends over time

- 🔔 **AI Health Summaries** - Get insights from your medical data**Prerequisites:**  Node.js



### For Doctors

- 👥 **Patient Management** - View and manage assigned patients1. Install dependencies:

- 📊 **Patient Overview** - Access patient vitals, medications, and records   `npm install`

- 💬 **Professional Messaging** - Secure communication with patients2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

- 🚨 **Urgent Alerts** - Receive and respond to urgent patient messages3. Run the app:

   `npm run dev`

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI**: Google Gemini for medical record analysis
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth with Row Level Security

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BeanHealth
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings > API in your Supabase dashboard
3. Copy your Project URL and anon public key

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key  # Optional
```

### 4. Set Up Database

1. Go to your Supabase project > SQL Editor
2. Copy and run the SQL commands from `supabase_schema.sql`
3. This will create all necessary tables, indexes, and security policies

### 5. Set Up Storage

**📋 Follow the detailed guide: [STORAGE_SETUP.md](./STORAGE_SETUP.md)**

**Quick Summary:**
1. Go to Storage > Buckets in your Supabase dashboard
2. Create a new bucket called `medical-records`
3. ✅ **Important**: Set the bucket to **public**
4. Set file size limit to 10MB
5. Add allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`

**Verify Setup:**
- Use the Storage Test component in the Upload section of the app
- All tests should show "SUCCESS" status

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

The application uses the following main tables:
- `users` - Patient and doctor profiles
- `vitals` - Patient health measurements
- `medications` - Patient medications
- `medical_records` - Uploaded medical documents
- `chat_messages` - Secure messaging between patients and doctors
- `patient_doctor_relationships` - Links patients to their doctors

## Security Features

- **Row Level Security (RLS)** - Patients can only access their own data
- **Doctor Access Control** - Doctors can only access their assigned patients
- **Secure File Storage** - Medical documents stored securely in Supabase Storage
- **Authentication** - Email/password authentication with Supabase Auth

## Optional Features

### AI Medical Record Analysis
If you provide a Google Gemini API key, the application can:
- Automatically analyze uploaded medical documents
- Extract key information (date, type, doctor, summary)
- Generate health summaries from medical records

To enable this feature:
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

## Development

### Project Structure
```
BeanHealth/
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── icons/          # Icon components
├── contexts/           # React contexts (Auth, Data)
├── lib/               # Configuration (Supabase client)
├── services/          # API services
├── types.ts           # TypeScript type definitions
└── supabase_schema.sql # Database schema
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider
3. Make sure your environment variables are configured in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.