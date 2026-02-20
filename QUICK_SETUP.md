# Quick Setup Guide for MediTimeline

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `meditimeline`
   - Database password: (create a strong password)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 1.2 Get Your API Keys
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 1.3 Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` file
4. Paste into the SQL editor
5. Click "Run" to execute
6. You should see success messages for table creation

## Step 2: Configure Environment Variables

### 2.1 Update .env File
Open the `.env` file in your project root and update:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_from_step_1.2
GEMINI_API_KEY=your_gemini_api_key_optional
```

### 2.2 Configure Supabase Edge Function
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-id
   ```
   (Find your project ID in the Project URL: `https://YOUR-PROJECT-ID.supabase.co`)

3. Set Edge Function secrets:
   ```bash
   supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   supabase secrets set OPENAI_API_KEY=your_openai_key_optional
   ```

4. Deploy the Edge Function:
   ```bash
   supabase functions deploy make-server-d794bcda
   ```

## Step 3: Configure Storage

### 3.1 Create Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Click "Create bucket"
3. Name: `make-d794bcda-prescriptions`
4. Public: **NO** (keep private)
5. Click "Create bucket"

### 3.2 Set Storage Policies
1. Click on your new bucket
2. Go to "Policies" tab
3. Add policy for authenticated users:
   - Policy name: `Users can upload own files`
   - Target roles: `authenticated`
   - Policy: `(bucket_id = 'make-d794bcda-prescriptions' AND auth.uid() = (storage.foldername(name))[1]::uuid)`
   - Allowed operations: SELECT, INSERT, DELETE

## Step 4: Get OpenAI API Key (Optional)

If you want AI-powered prescription analysis:

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API keys section
4. Create new secret key
5. Copy and add to your `.env` and Supabase secrets

**Note:** Without OpenAI, the app will use mock data for prescription analysis.

## Step 5: Install and Run

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Run Development Server
```bash
npm run dev
```

Open browser to `http://localhost:5173`

## Step 6: Test the Application

### 6.1 Create Account
1. Click "Sign Up"
2. Enter name, email, and password
3. Click "Create Account"

### 6.2 Upload a Prescription
1. On the dashboard, click "Choose from Files" or "Take Photo"
2. Select a prescription image
3. Wait for AI analysis (or mock data)
4. View your prescription in the grid/timeline

### 6.3 Generate Medical Summary
1. Click "Medical Summary" button in header
2. View comprehensive health report
3. Download as PDF or JSON

## Troubleshooting

### Issue: "Unauthorized" Error
**Solution:** Check that your SUPABASE_URL and SUPABASE_ANON_KEY are correct in `.env`

### Issue: Edge Function Not Working
**Solutions:**
1. Verify Edge Function is deployed: `supabase functions list`
2. Check function logs: `supabase functions logs make-server-d794bcda`
3. Ensure secrets are set correctly

### Issue: Upload Fails
**Solutions:**
1. Check storage bucket exists and is named correctly
2. Verify storage policies are set
3. Check browser console for errors

### Issue: Database Errors
**Solutions:**
1. Verify schema.sql was executed successfully
2. Check RLS policies are enabled
3. Ensure user is authenticated

### Issue: AI Analysis Returns Mock Data
**This is normal if:**
- OpenAI API key is not configured
- OpenAI API key is invalid
- API quota exceeded

## Production Deployment

### Deploy Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables
4. Deploy

### Deploy Edge Functions
Already deployed in Step 2.2!

## Need Help?

1. Check Supabase dashboard logs
2. Check browser console (F12)
3. Review error messages carefully
4. Verify all environment variables are set
5. Ensure database schema is applied

## Success Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Storage bucket created
- [ ] Environment variables configured
- [ ] Edge Function deployed and secrets set
- [ ] Dependencies installed
- [ ] App runs locally
- [ ] Can sign up/login
- [ ] Can upload prescriptions
- [ ] Can view medical summary

---

**Ready to manage your medical history! 🏥**
