// @ts-nocheck - This file is for Supabase Edge Functions (Deno runtime)
/// <reference lib="deno.ns" />
// @deno-types="npm:hono"
import { Hono } from "npm:hono";
import type { Context } from "npm:hono";
// @deno-types="npm:hono/cors"
import { cors } from "npm:hono/cors";
// @deno-types="npm:hono/logger"
import { logger } from "npm:hono/logger";
// @deno-types="npm:@supabase/supabase-js@2"
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// KV Store Functions (inline)
const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const client = kvClient();
    const { error } = await client.from("kv_store_d794bcda").upsert({ key, value });
    if (error) throw new Error(error.message);
  },
  
  get: async (key: string): Promise<any> => {
    const client = kvClient();
    const { data, error } = await client.from("kv_store_d794bcda").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },
  
  del: async (key: string): Promise<void> => {
    const client = kvClient();
    const { error } = await client.from("kv_store_d794bcda").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
  
  mget: async (keys: string[]): Promise<any[]> => {
    const client = kvClient();
    const { data, error} = await client.from("kv_store_d794bcda").select("value").in("key", keys);
    if (error) throw new Error(error.message);
    return data?.map((d: any) => d.value) ?? [];
  }
};

// Create storage bucket on startup
const BUCKET_NAME = "make-d794bcda-prescriptions";
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log("Created prescriptions bucket");
  }
})();

// Also create KV table if not exists
(async () => {
  const { error } = await supabase.from("kv_store_d794bcda").select("key").limit(1);
  if (error && error.code === '42P01') {
    // Table doesn't exist, create it
    console.log("Note: kv_store_d794bcda table needs to be created via SQL");
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d794bcda/health", (c: Context) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-d794bcda/signup", async (c: Context) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Failed to sign up user" }, 500);
  }
});

// Upload prescription endpoint
app.post("/make-server-d794bcda/upload-prescription", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { imageData, fileName } = body;

    // Upload to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${fileName}`;
    const base64Data = imageData.split(",")[1];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: "image/*",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000);

    const analysis = await analyzePrescription(imageData);

    const prescriptionId = `prescription_${user.id}_${Date.now()}`;
    const prescriptionData = {
      id: prescriptionId,
      userId: user.id,
      fileName,
      filePath,
      imageUrl: urlData?.signedUrl,
      uploadDate: new Date().toISOString(),
      ...analysis,
    };

    await kv.set(prescriptionId, prescriptionData);

    const userPrescriptionsKey = `user_prescriptions_${user.id}`;
    const existingPrescriptions = (await kv.get(userPrescriptionsKey)) || [];
    await kv.set(userPrescriptionsKey, [...existingPrescriptions, prescriptionId]);

    const alerts = await checkHealthAlerts(user.id, analysis);

    return c.json({ 
      prescription: prescriptionData,
      alerts 
    });
  } catch (error) {
    console.error("Upload prescription error:", error);
    return c.json({ error: "Failed to process prescription" }, 500);
  }
});

// Get user prescriptions
app.get("/make-server-d794bcda/prescriptions", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userPrescriptionsKey = `user_prescriptions_${user.id}`;
    const prescriptionIds = (await kv.get(userPrescriptionsKey)) || [];
    const prescriptions = await kv.mget(prescriptionIds);

    return c.json({ prescriptions });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return c.json({ error: "Failed to fetch prescriptions" }, 500);
  }
});

// Get health summary
app.get("/make-server-d794bcda/health-summary", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const summary = await generateHealthSummary(user.id);
    return c.json({ summary });
  } catch (error) {
    console.error("Get health summary error:", error);
    return c.json({ error: "Failed to generate health summary" }, 500);
  }
});

// Delete prescription
app.delete("/make-server-d794bcda/prescription/:id", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const prescriptionId = c.req.param("id");
    const prescription = await kv.get(prescriptionId);

    if (!prescription || prescription.userId !== user.id) {
      return c.json({ error: "Prescription not found" }, 404);
    }

    await supabase.storage.from(BUCKET_NAME).remove([prescription.filePath]);
    await kv.del(prescriptionId);

    const userPrescriptionsKey = `user_prescriptions_${user.id}`;
    const prescriptionIds = (await kv.get(userPrescriptionsKey)) || [];
    await kv.set(userPrescriptionsKey, prescriptionIds.filter((id: string) => id !== prescriptionId));

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return c.json({ error: "Failed to delete prescription" }, 500);
  }
});

// Comprehensive summary
app.get("/make-server-d794bcda/comprehensive-summary", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userPrescriptionsKey = `user_prescriptions_${user.id}`;
    const prescriptionIds = (await kv.get(userPrescriptionsKey)) || [];
    const prescriptions = await kv.mget(prescriptionIds);

    const userAlertsKey = `user_alerts_${user.id}`;
    const alerts = (await kv.get(userAlertsKey)) || [];

    const departmentCounts: Record<string, number> = {};
    const medications: any[] = [];
    const medicalHistory: any[] = [];
    const doctors: Set<string> = new Set();
    const hospitals: Set<string> = new Set();
    let criticalConditions = 0;
    let firstDate = new Date();
    let lastDate = new Date(0);

    prescriptions.forEach((p: any) => {
      if (p.department) departmentCounts[p.department] = (departmentCounts[p.department] || 0) + 1;
      if (p.medicationName) {
        medications.push({
          name: p.medicationName,
          department: p.department,
          dosage: p.dosage,
          frequency: p.frequency,
          prescribedBy: p.prescribedBy,
          date: p.prescriptionDate || p.uploadDate,
          isActive: true,
        });
      }
      medicalHistory.push({
        date: p.prescriptionDate || p.uploadDate,
        medication: p.medicationName,
        diagnosis: p.diagnosis || "N/A",
        doctor: p.prescribedBy,
        hospital: p.hospital,
        department: p.department,
        severity: p.severity,
      });
      if (p.prescribedBy) doctors.add(p.prescribedBy);
      if (p.hospital) hospitals.add(p.hospital);
      if (p.lifeThreatening) criticalConditions++;

      const prescDate = new Date(p.prescriptionDate || p.uploadDate);
      if (prescDate < firstDate) firstDate = prescDate;
      if (prescDate > lastDate) lastDate = prescDate;
    });

    medicalHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const criticalAlerts = alerts
      .filter((a: any) => a.type === "critical" || a.type === "warning")
      .map((a: any) => ({
        type: a.type,
        title: a.title,
        message: a.message,
        date: a.timestamp,
      }));

    const summary = {
      userInfo: {
        name: user.user_metadata.name || "User",
        email: user.email,
        userId: user.id,
      },
      overview: {
        totalPrescriptions: prescriptions.length,
        activeMedications: medications.filter(m => m.isActive).length,
        totalDepartments: Object.keys(departmentCounts).length,
        totalDoctors: doctors.size,
        totalHospitals: hospitals.size,
        criticalConditions,
        firstPrescriptionDate: firstDate.toISOString(),
        lastPrescriptionDate: lastDate.toISOString(),
      },
      departmentBreakdown: departmentCounts,
      medications,
      medicalHistory,
      criticalAlerts,
      doctorsAndHospitals: {
        doctors: Array.from(doctors),
        hospitals: Array.from(hospitals),
      },
      generatedAt: new Date().toISOString(),
    };

    return c.json({ summary });
  } catch (error) {
    console.error("Comprehensive summary error:", error);
    return c.json({ error: "Failed to generate comprehensive summary" }, 500);
  }
});

// Export summary
app.post("/make-server-d794bcda/export-summary", async (c: Context) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userPrescriptionsKey = `user_prescriptions_${user.id}`;
    const prescriptionIds = (await kv.get(userPrescriptionsKey)) || [];
    const prescriptions = await kv.mget(prescriptionIds);

    return c.json({ prescriptions });
  } catch (error) {
    console.error("Export summary error:", error);
    return c.json({ error: "Failed to export summary" }, 500);
  }
});

// Helper functions
async function analyzePrescription(_imageData: string) {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    return getMockAnalysis();
  }
  // OpenAI integration would go here
  return getMockAnalysis();
}

function getMockAnalysis() {
  return {
    medicationName: "Sample Medication",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    department: "General Medicine",
    prescribedBy: "Dr. Smith",
    hospital: "General Hospital",
    prescriptionDate: new Date().toISOString().split('T')[0],
    diagnosis: "General checkup",
    instructions: "Take with food",
    severity: "low",
    lifeThreatening: false,
  };
}

async function checkHealthAlerts(userId: string, analysis: any) {
  const alerts = [];
  if (analysis.lifeThreatening) {
    alerts.push({
      type: "critical",
      title: "Life-Threatening Condition Detected",
      message: `Serious condition: ${analysis.diagnosis}`,
      timestamp: new Date().toISOString(),
    });
  }
  if (alerts.length > 0) {
    const userAlertsKey = `user_alerts_${userId}`;
    const existingAlerts = (await kv.get(userAlertsKey)) || [];
    await kv.set(userAlertsKey, [...existingAlerts, ...alerts]);
  }
  return alerts;
}

async function generateHealthSummary(userId: string) {
  const userPrescriptionsKey = `user_prescriptions_${userId}`;
  const prescriptionIds = (await kv.get(userPrescriptionsKey)) || [];
  const prescriptions = await kv.mget(prescriptionIds);

  const userAlertsKey = `user_alerts_${userId}`;
  const alerts = (await kv.get(userAlertsKey)) || [];

  const departmentCounts: Record<string, number> = {};
  const medications: string[] = [];
  const doctors: Set<string> = new Set();
  const hospitals: Set<string> = new Set();

  prescriptions.forEach((p: any) => {
    if (p.department) departmentCounts[p.department] = (departmentCounts[p.department] || 0) + 1;
    if (p.medicationName) medications.push(p.medicationName);
    if (p.prescribedBy) doctors.add(p.prescribedBy);
    if (p.hospital) hospitals.add(p.hospital);
  });

  return {
    totalPrescriptions: prescriptions.length,
    departments: departmentCounts,
    
    activeMedications: medications,
    doctorsVisited: Array.from(doctors),
    hospitalsVisited: Array.from(hospitals),
    recentAlerts: alerts.slice(-10),
    lastUpdated: new Date().toISOString(),
  };
}

Deno.serve(app.fetch);
