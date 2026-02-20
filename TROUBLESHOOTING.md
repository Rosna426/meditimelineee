# Troubleshooting Prescription Upload

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the "Console" tab
3. Try uploading a prescription
4. Look for error messages (red text)

Common errors:
- **401 Unauthorized**: Edge function environment variables not set
- **403 Forbidden**: Storage bucket permissions issue  
- **500 Internal Server Error**: Edge function error

## Step 2: Verify Edge Function Environment Variables

1. Go to: https://supabase.com/dashboard/project/jrksurqtennacxmotgzq/functions/make-server-d794bcda/settings
2. Check that these secrets are set:
   - `SUPABASE_URL` = `https://jrksurqtennacxmotgzq.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (from Settings > API > service_role key - LONG key, not anon key)

## Step 3: Check Storage Bucket

1. Go to: https://supabase.com/dashboard/project/jrksurqtennacxmotgzq/storage/buckets
2. Check if bucket `make-d794bcda-prescriptions` exists
3. If not, create it:
   - Click "New bucket"
   - Name: `make-d794bcda-prescriptions`
   - Public: **OFF** (private)
   - Click "Create"

## Step 4: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/jrksurqtennacxmotgzq/functions/make-server-d794bcda/logs
2. Try uploading again
3. Look for error messages in the logs

## Step 5: Test Edge Function Directly

Open a new terminal and test the upload endpoint:

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN_HERE"
}

$body = @{
    imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    fileName = "test.png"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://jrksurqtennacxmotgzq.supabase.co/functions/v1/make-server-d794bcda/upload-prescription" -Method POST -Headers $headers -Body $body
```

Replace `YOUR_ACCESS_TOKEN_HERE` with your actual access token (you can get it from browser console after logging in).

## Most Common Issue: Missing Service Role Key

The most common reason upload fails is the **SUPABASE_SERVICE_ROLE_KEY** environment variable not being set in the edge function.

To fix:
1. Go to: https://supabase.com/dashboard/project/jrksurqtennacxmotgzq/settings/api
2. Copy the **service_role** key (it's very long, starts with "eyJ...")
3. Go to: https://supabase.com/dashboard/project/jrksurqtennacxmotgzq/functions/make-server-d794bcda/settings
4. Add environment secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste the service_role key)
5. Save and redeploy if needed
