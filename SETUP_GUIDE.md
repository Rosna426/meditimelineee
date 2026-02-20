# MediTimeline - Medical History Organization System

A comprehensive medical history management application that helps users organize prescriptions, track medical records across departments, and generate detailed health summaries for healthcare provider transitions and emergency situations.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure signup and login using Supabase Auth
- **Prescription Upload**: Upload prescriptions via file upload or camera capture
- **AI-Powered Analysis**: Automatic extraction of prescription details using OpenAI GPT-4
- **Smart Organization**: Automatic categorization by medical department
- **Medical Timeline**: Visual timeline view of your complete medical history
- **Comprehensive Search**: Search and filter by medication, doctor, hospital, department, date, and severity
- **Health Summaries**: Generate detailed medical history summaries for:
  - Doctor/hospital changes
  - Emergency situations
  - Personal health tracking
- **Export Capabilities**: Download your medical history as PDF, JSON, or HTML
- **Smart Alerts**: Automatic detection of:
  - Life-threatening conditions
  - High-severity medications
  - Doctor/hospital changes
  - Critical health alerts

### Key Views
1. **Dashboard**: Overview with statistics and quick access
2. **Grid View**: Card-based prescription display
3. **Timeline View**: Chronological medical history visualization
4. **Medical Summary**: Comprehensive health report with export options

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account
- OpenAI API key (optional, for prescription analysis)

### Installation

1. **Clone the repository**
   ```bash
   cd meditimeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database schema (see Database Setup below)

4. **Configure environment variables**
   
   Create or update `.env` file:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key (optional)
   ```

   For the Supabase Edge Function, also configure:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key (optional)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Deploy Supabase Edge Function**
   ```bash
   supabase functions deploy make-server-d794bcda
   ```

## 📊 Database Setup

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Execute the SQL script

This will create:
- User profiles table
- Prescriptions table with full text search
- Medical departments lookup
- Medical alerts system
- Health summaries storage
- Healthcare providers tracking
- Row Level Security (RLS) policies
- Necessary indexes and functions

### Manual Table Creation

If you prefer the current KV store approach, the application will work without running the schema. However, the PostgreSQL database provides:
- Better query performance
- Relational data integrity
- Advanced search capabilities
- Data backup and recovery

## 🔑 Environment Configuration

### Client-side (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional: AI Services
GEMINI_API_KEY=your_gemini_api_key
```

### Server-side (Supabase Edge Function)
Configure these in your Supabase dashboard under Settings > Edge Functions > Secrets:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## 📁 Project Structure

```
meditimeline/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── MedicalSummary.tsx       # Comprehensive health summary
│   │   │   ├── MedicalTimeline.tsx      # Timeline view component
│   │   │   ├── PrescriptionSearch.tsx   # Search and filter component
│   │   │   └── ui/                      # UI components
│   │   ├── hooks/
│   │   │   └── useAuth.tsx              # Authentication hook
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx            # Main dashboard
│   │   │   ├── Login.tsx                # Login page
│   │   │   ├── Signup.tsx               # Signup page
│   │   │   └── NotFound.tsx             # 404 page
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx            # Authenticated layout
│   │   │   └── AuthLayout.tsx           # Authentication layout
│   │   ├── App.tsx                      # Main app component
│   │   ├── routes.ts                    # Route configuration
│   │   └── types.ts                     # TypeScript types
│   ├── styles/
│   │   ├── index.css                    # Global styles
│   │   └── tailwind.css                 # Tailwind configuration
│   └── main.tsx                         # Entry point
├── supabase/
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx                # Edge function server
│   │       └── kv_store.tsx             # KV store utilities
│   └── schema.sql                       # Database schema
├── utils/
│   └── supabase/
│       └── info.tsx                     # Supabase configuration
├── .env                                 # Environment variables
├── package.json                         # Dependencies
├── vite.config.ts                       # Vite configuration
└── README.md                            # This file
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Secure Authentication**: Powered by Supabase Auth
- **API Key Protection**: Environment variables for sensitive keys
- **Image Storage**: Secure storage with signed URLs
- **CORS Protection**: Configured for authorized origins only

## 🎯 Use Cases

### 1. Doctor Visits
Generate a comprehensive medical summary before appointments to provide your doctor with complete medical history.

### 2. Hospital Changes
Export your medical records when switching healthcare providers to ensure continuity of care.

### 3. Emergency Situations
Quick access to life-threatening conditions, allergies, and current medications for emergency responders.

### 4. Medical Tourism
Carry your complete medical history when traveling or seeking treatment abroad.

### 5. Personal Health Tracking
Monitor medication patterns, department visits, and health trends over time.

## 🔧 API Endpoints

### Authentication
- `POST /make-server-d794bcda/signup` - Create new user account

### Prescriptions
- `POST /make-server-d794bcda/upload-prescription` - Upload and analyze prescription
- `GET /make-server-d794bcda/prescriptions` - Get user's prescriptions
- `DELETE /make-server-d794bcda/prescription/:id` - Delete prescription

### Health Data
- `GET /make-server-d794bcda/health-summary` - Get basic health summary
- `GET /make-server-d794bcda/comprehensive-summary` - Get detailed medical history
- `POST /make-server-d794bcda/export-summary` - Export summary (PDF/JSON)

## 🌐 Deployment

### Frontend (Vite App)
```bash
npm run build
```
Deploy the `dist` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Or any static hosting service

### Backend (Supabase Edge Functions)
```bash
supabase link --project-ref your-project-ref
supabase functions deploy make-server-d794bcda
```

## 🤝 Contributing

This is a personal medical history project. If you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and for personal use.

## ⚠️ Disclaimer

This application is for personal medical record organization only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

## 🆘 Support

For issues or questions:
1. Check existing documentation
2. Review Supabase logs for backend errors
3. Check browser console for frontend errors
4. Verify environment variables are correctly set

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Medication reminders
- [ ] Integration with pharmacy systems
- [ ] Multi-language support
- [ ] Voice notes for prescriptions
- [ ] Family member profiles
- [ ] Insurance claim tracking
- [ ] Lab results integration
- [ ] Appointment scheduling
- [ ] Telemedicine integration

## 📝 Version History

### v2.0.0 (Current)
- ✅ Comprehensive medical summary generation
- ✅ Timeline view for medical history
- ✅ Advanced search and filtering
- ✅ Export to PDF/JSON/HTML
- ✅ PostgreSQL database schema
- ✅ Enhanced UI/UX

### v1.0.0
- ✅ Basic prescription upload
- ✅ AI-powered analysis
- ✅ Department categorization
- ✅ User authentication
- ✅ Basic dashboard

---

**Built with ❤️ for better healthcare management**
