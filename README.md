# 🏥 BeanHealth - Healthcare Management Platform

> A comprehensive healthcare management platform connecting patients and doctors

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)]()

---

## ✨ Key Features

### 👤 For Patients
- 📊 Health Dashboard with vitals tracking
- 💊 Medication management with timeline
- 📄 Medical records with AI analysis
- 💬 Secure messaging with doctors
- 📈 Health progress tracking
- 💊 Receive and download prescriptions

### 👨‍⚕️ For Doctors
- � Patient management dashboard
- 💬 Secure patient communication
- 🚨 Urgent message alerts
- 💊 Create & send prescriptions (PDF)
- 📋 Comprehensive patient records
- � Patient health monitoring

### 🆕 Latest Features
- **Prescription System** - Doctors can create professional prescriptions with automatic PDF generation and chat delivery
- **AI Health Assistant** - Google Gemini-powered medical insights
- **Real-time Chat** - Instant messaging with file sharing
- **Smart Vitals Extraction** - Auto-extract health data from documents

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your Supabase and Gemini API keys

# Run database migrations (see SETUP.md)

# Start development server
npm run dev
```

📖 **Detailed setup instructions**: See [`SETUP.md`](./SETUP.md)

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS (Dark/Light mode)
- **PDF**: jsPDF + jspdf-autotable
- **Deployment**: Netlify

---

## 📁 Project Structure

```
BeanHealth/
├── components/          # React components
├── services/           # API and business logic
├── utils/              # Utility functions
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── styles/             # Global styles
├── docs/               # Documentation
│   ├── PRESCRIPTION_README.md
│   ├── DEPLOYMENT.md
│   └── ...
├── *.sql               # Database schemas
├── SETUP.md            # Setup guide
└── README.md           # This file
```

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[docs/PRESCRIPTION_README.md](./docs/PRESCRIPTION_README.md)** - Prescription feature
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[docs/REALTIME_CHAT_SETUP.md](./docs/REALTIME_CHAT_SETUP.md)** - Chat setup

---

## 🔒 Security

- Row Level Security (RLS) on all tables
- Secure authentication with Supabase Auth
- Role-based access control
- Encrypted file storage
- HIPAA-compliant architecture

---

## 🚀 Deployment

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for production deployment instructions.

Quick deploy to Netlify:
```bash
npm run build
# Deploy dist/ folder to Netlify
```

---

## 📱 Screenshots

Coming soon...

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

Built with ❤️ using:
- React & TypeScript
- Supabase
- Google Gemini
- Tailwind CSS

---

**Made for BeanHealth** 🫘💚
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
