# 🏥 MediTimeline

> An intelligent medical prescription management system powered by AI

MediTimeline is a comprehensive healthcare application that helps users organize, analyze, and track their medical prescriptions using advanced AI technology. Upload prescription images and get instant AI-powered analysis with automatic data extraction and chronological timeline visualization.

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://meditimelineee.vercel.app)
[![GitHub](https://img.shields.io/badge/github-repository-blue)](https://github.com/Rosna426/meditimelineee)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Intelligent OCR**: Extract text from prescription images using Google Gemini 1.5 Flash
- **Automatic Data Extraction**: Identify medications, dosages, frequencies, and durations
- **Smart Categorization**: Organize prescriptions by condition and treatment type

### 📊 Medical Dashboard
- **Timeline View**: Visualize your medical history chronologically
- **Health Summary**: Comprehensive overview of ongoing treatments and medications
- **Prescription Search**: Quick search and filter capabilities
- **Export Functionality**: Download your medical data as PDF or CSV

### 🔒 Security & Privacy
- **Secure Authentication**: Built with Supabase Auth
- **Encrypted Storage**: Your medical data is securely stored
- **Privacy-First**: Your health information never leaves secure servers

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean interface built with Tailwind CSS and Radix UI
- **Real-time Updates**: Instant synchronization across devices

## 🚀 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS 4.0** - Styling framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Edge Functions (Deno runtime)
  - Authentication
  - Storage
- **Hono 4.4** - Web framework for Edge Functions
- **Google Gemini 1.5 Flash** - AI vision model

### Infrastructure
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend and database hosting
- **GitHub** - Version control

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Supabase Account** ([Sign up](https://supabase.com))
- **Google AI Studio API Key** ([Get one](https://makersuite.google.com/app/apikey))
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Rosna426/meditimelineee.git
cd meditimelineee
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your project URL and anon key

#### Set Up Database Schema
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Alternatively, run the SQL files manually:
- Execute `supabase/schema.sql` in the SQL Editor
- Execute `supabase/kv-table-setup.sql` in the SQL Editor

#### Deploy Edge Function
```bash
# Deploy the backend function
supabase functions deploy make-server-d794bcda

# Set environment secrets
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Configure Frontend

Update `src/lib/supabase.ts` with your Supabase credentials:

```typescript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'
```

Update `utils/supabase/info.tsx` with your project details.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Deploy Frontend to Vercel

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository: `Rosna426/meditimelineee`
   - Configure settings:
     - Framework Preset: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click **Deploy**

3. **Your app will be live** at `https://your-app.vercel.app`

### Backend is Already Deployed
The Supabase Edge Functions are already deployed and running at:
```
https://jrksurqtennacxmotgzq.supabase.co/functions/v1/make-server-d794bcda
```

## 📱 Usage

### Getting Started

1. **Sign Up / Login**
   - Create an account with email and password
   - Or use social authentication (if configured)

2. **Upload a Prescription**
   - Click the "Upload Prescription" button
   - Select an image file (JPG, PNG, WebP)
   - AI will automatically extract prescription details

3. **View Your Timeline**
   - See all prescriptions organized chronologically
   - Filter by date, medication, or condition
   - Click on any prescription for detailed view

4. **Generate Health Summary**
   - Get a comprehensive overview of ongoing treatments
   - View medication interactions and warnings
   - Export your medical history

### API Endpoints

The backend provides the following REST API:

```
POST   /upload-prescription    - Upload and analyze prescription
GET    /prescriptions          - List all prescriptions
GET    /prescription/:id       - Get prescription details
DELETE /prescription/:id       - Delete a prescription
GET    /health-summary         - Generate health summary
GET    /comprehensive-summary  - Full medical report
POST   /export-data            - Export as PDF/CSV
```

## 📁 Project Structure

```
meditimeline/
├── src/
│   ├── app/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Shadcn/ui components
│   │   │   ├── AddEventDialog.tsx
│   │   │   ├── MedicalTimeline.tsx
│   │   │   └── MedicalSummary.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── App.tsx          # Main app component
│   │   └── routes.ts        # Route definitions
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   └── styles/              # CSS files
├── supabase/
│   ├── functions/           # Edge Functions
│   │   └── make-server-d794bcda/
│   │       └── index.ts     # Main backend logic
│   ├── schema.sql          # Database schema
│   └── kv-table-setup.sql  # KV store setup
├── utils/
│   └── supabase/           # Utility functions
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔧 Configuration

### Environment Variables

For local development, create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Function Secrets

Set these in Supabase Dashboard or via CLI:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

**Build fails with missing dependencies**
```bash
npm install --force
```

**Supabase connection errors**
- Verify your project URL and API keys
- Check if Edge Functions are deployed
- Ensure database tables exist

**AI analysis not working**
- Verify GEMINI_API_KEY is set correctly
- Check Supabase function logs
- Ensure image format is supported

For more help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rosna** - [@Rosna426](https://github.com/Rosna426)
- **Sherin** - [@Sherin745](https://github.com/Sherin745)

## 🙏 Acknowledgments

- Original design from [Figma](https://www.figma.com/design/sz5d9LA1Y5Bd3H89nO2HwV/Build-MediTimeline-Application)
- Google Gemini AI for prescription analysis
- Supabase for backend infrastructure
- Shadcn/ui for component library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Rosna426/meditimelineee/issues)
- **Email**: rosnapr206@gmail.com
- **Documentation**: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Medication reminders
- [ ] Doctor appointment scheduling
- [ ] Health metrics tracking
- [ ] Multi-language support
- [ ] Insurance integration
- [ ] Telemedicine features

---

<div align="center">
  Made with ❤️ for better healthcare management
</div>
