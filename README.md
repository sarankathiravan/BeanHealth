# BeanHealth - Healthcare Management Platform

<div align="center">

BeanHealth is a comprehensive healthcare management platform built with React, TypeScript, and Supabase. It provides separate portals for patients and doctors with features like health tracking, medical record management, secure messaging, and AI-powered health summaries.

</div>

## ✨ Features

### For Patients
- 📊 **Health Dashboard** - Track vitals (blood pressure, heart rate, temperature, glucose)
- � ***Medication Management** - Add, edit, and track medications with timeline view
- 📄 **Medical Records** - Upload and organize medical documents with AI analysis
- � ***Secure Messaging** - Chat with your doctors, send urgent messages
- 📈 **Progress Tracking** - View health trends over time with interactive charts
- �  **AI Health Summaries** - Get insights from your medical data
- 📸 **Profile Management** - Upload profile pictures and manage personal information
- 🤖 **Smart Vitals Extraction** - Automatically extract vitals from uploaded medical records

### For Doctors
- 👥 **Patient Management** - View and manage assigned patients
- � **Patientt Overview** - Access patient vitals, medications, and records
- 💬 **Professional Messaging** - Secure communication with patients
- 🚨 **Urgent Alerts** - Receive and respond to urgent patient messages
- 📋 **Patient Roster** - Comprehensive patient list with key metrics
- 🔍 **Medical Record Review** - Access and analyze patient medical documents

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI**: Google Gemini for medical record analysis and vitals extraction
- **Styling**: Tailwind CSS with dark/light theme support
- **Authentication**: Supabase Auth with Row Level Security
- **File Storage**: Supabase Storage with secure bucket policies
- **Deployment**: Netlify with automatic builds

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

## 🗄 Database Schema

The application uses the following main tables:
- **`users`** - Patient and doctor profiles with authentication
- **`vitals`** - Patient health measurements and trends
- **`medications`** - Patient medications with dosage and frequency
- **`medical_records`** - Uploaded medical documents with AI analysis
- **`chat_messages`** - Secure messaging between patients and doctors
- **`patient_doctor_relationships`** - Links patients to their doctors

**Storage Buckets:**
- **`medical-records`** - Secure file storage for medical documents (PDFs, images)

## Security Features

- **Row Level Security (RLS)** - Patients can only access their own data
- **Doctor Access Control** - Doctors can only access their assigned patients
- **Secure File Storage** - Medical documents stored securely in Supabase Storage
- **Authentication** - Email/password authentication with Supabase Auth

## 🤖 AI Features

### Medical Record Analysis (Optional)
If you provide a Google Gemini API key, the application can:
- **Automatically analyze uploaded medical documents** (PDFs, images)
- **Extract key information** (date, type, doctor, summary)
- **Smart vitals extraction** - Automatically detect and update patient vitals from medical records
- **Generate comprehensive health summaries** from all medical records
- **Real-time analysis** - Process documents as they're uploaded

**Supported Vitals Extraction:**
- Blood Pressure (systolic/diastolic)
- Heart Rate (BPM)
- Temperature (°F/°C with automatic conversion)
- Blood Glucose (mg/dL)

To enable AI features:
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file as `VITE_GEMINI_API_KEY`
3. The app works without AI but with reduced functionality

## Development

### Project Structure
```
BeanHealth/
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── icons/          # Icon components
├── contexts/           # React contexts (Auth, Data, Theme)
├── lib/               # Configuration (Supabase client)
├── services/          # API services
│   ├── authService.ts      # User authentication & profiles
│   ├── chatService.ts      # Messaging functionality
│   ├── geminiService.ts    # AI analysis & vitals extraction
│   ├── medicalRecordsService.ts # Medical records CRUD
│   └── storageService.ts   # File upload & storage
├── types.ts           # TypeScript type definitions
├── supabase_schema.sql # Database schema
└── supabase_storage_setup.sql # Storage policies
```

### Available Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests (placeholder)

## 🚀 Deployment

### Quick Deploy to Netlify
The easiest way to deploy BeanHealth is using Netlify:

1. **Connect your GitHub repository** to Netlify
2. **Set build settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Configure environment variables** in Netlify dashboard
4. **Deploy automatically** on every push to main branch

**📋 Detailed deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in production
4. Ensure SPA routing is configured (see `public/_redirects`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
