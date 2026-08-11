import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<unknown>) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    await testFn();
    testResults.push({ name, success: true });
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    testResults.push({ name, success: false, error: errorMessage });
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${errorMessage}`);
  }
}

async function login(supabase: any, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login failed: ${error.message}`);
  }

  return data.user;
}

async function testCategoryCreation(supabase: any) {
  const testName = "קטגוריה בדיקה";
  const testSlug = "category-test-" + Date.now();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: testName,
      slug: testSlug,
      type: "recipe",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from category creation");
  }

  // Cleanup
  await supabase.from("categories").delete().eq("id", data.id);

  return data;
}

async function testTagCreation(supabase: any) {
  const testName = "תגית בדיקה";
  const testSlug = "tag-test-" + Date.now();

  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: testName,
      slug: testSlug,
      type: "recipe",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from tag creation");
  }

  // Cleanup
  await supabase.from("tags").delete().eq("id", data.id);

  return data;
}

async function testServiceCreation(supabase: any) {
  const testTitle = "שירות בדיקה";
  const testSlug = "service-test-" + Date.now();

  const { data, error } = await supabase
    .from("services")
    .insert({
      title: testTitle,
      slug: testSlug,
      short_description: "תיאור קצר לבדיקה",
      full_introduction: "הקדמה לבדיקה",
      content: {
        target_audience: [{ text: "קהל יעד לבדיקה" }],
        benefits: [{ text: "יתרון לבדיקה" }],
        process_steps: [{ title: "שלב 1", description: "תיאור שלב" }],
        faq: [{ question: "שאלה?", answer: "תשובה" }],
        cta_title: "כותרת",
        cta_text: "טקסט",
        cta_button_label: "לחץ",
        cta_link_type: "internal",
        cta_link_url: "/",
      },
      seo: { title: "SEO", description: "SEO description" },
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from service creation");
  }

  // Cleanup
  await supabase.from("services").delete().eq("id", data.id);

  return data;
}

async function testRecipeCreation(supabase: any) {
  const testTitle = "מתכון בדיקה";
  const testSlug = "recipe-test-" + Date.now();

  // First, get a valid category
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("type", "recipe")
    .limit(1);

  const categoryId = categories?.[0]?.id;

  if (!categoryId) {
    console.warn("⚠️  No category found for recipe test, skipping");
    return null;
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      title: testTitle,
      slug: testSlug,
      description: "תיאור למתכון הבדיקה",
      cover_media_id: null, // We'll test with null for now
      category_id: categoryId,
      prep_duration: 30,
      servings: 4,
      content: {
        recipe_sections: [
          {
            title: "סקשן 1",
            ingredients: [
              { amount: "1", unit: "כפית", name: "מרכיב 1" },
            ],
          },
        ],
        yael_tip: "טיפ לבדיקה",
        gallery: [],
      },
      seo: { title: "SEO", description: "SEO description" },
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create recipe: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from recipe creation");
  }

  // Cleanup
  await supabase.from("recipes").delete().eq("id", data.id);

  return data;
}

async function testArticleCreation(supabase: any) {
  const testTitle = "פוסט בדיקה";
  const testSlug = "article-test-" + Date.now();

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: testTitle,
      slug: testSlug,
      body: "תוכן הפוסט",
      cover_media_id: null,
      reading_time_minutes: 5,
      content: {
        blocks: [
          {
            type: "text",
            content: "תוכן הבלוק",
          },
        ],
        gallery: [],
      },
      seo: { title: "SEO", description: "SEO description" },
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create article: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from article creation");
  }

  // Cleanup
  await supabase.from("articles").delete().eq("id", data.id);

  return data;
}

async function testPressCreation(supabase: any) {
  const testTitle = "כתבה בדיקה";
  const testSlug = "press-test-" + Date.now();

  const { data, error } = await supabase
    .from("press_articles")
    .insert({
      title: testTitle,
      slug: testSlug,
      publication_name: "מגזין בדיקה",
      published_at: new Date().toISOString(),
      pdf_media_id: null,
      excerpt: "תקציר לכתבה",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create press article: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from press article creation");
  }

  // Cleanup
  await supabase.from("press_articles").delete().eq("id", data.id);

  return data;
}

async function testSlugAutoGeneration(supabase: any) {
  // Test that changing title generates new slug
  const testTitle = "שירות לבדיקת סלאג";
  const testSlug = "service-slug-test-" + Date.now();

  const { data: service } = await supabase
    .from("services")
    .insert({
      title: testTitle,
      slug: testSlug,
      short_description: "תיאור קצר",
      full_introduction: "הקדמה",
      content: {
        target_audience: [],
        benefits: [],
        process_steps: [],
        faq: [],
        cta_title: "",
        cta_text: "",
        cta_button_label: "",
        cta_link_type: "internal",
        cta_link_url: "/",
      },
      seo: { title: "", description: "" },
      status: "draft",
    })
    .select()
    .single();

  if (!service) {
    throw new Error("Failed to create service for slug test");
  }

  // Update title
  const newTitle = "שירות עם כותרת חדשה";
  const { error: updateError } = await supabase
    .from("services")
    .update({ title: newTitle })
    .eq("id", service.id);

  if (updateError) {
    await supabase.from("services").delete().eq("id", service.id);
    throw new Error(`Failed to update service title: ${updateError.message}`);
  }

  // Cleanup
  await supabase.from("services").delete().eq("id", service.id);

  return true;
}

async function testStatusTransitions(supabase: any) {
  const testTitle = "שירות לבדיקת סטטוס";
  const testSlug = "service-status-test-" + Date.now();

  const { data: service } = await supabase
    .from("services")
    .insert({
      title: testTitle,
      slug: testSlug,
      short_description: "תיאור קצר",
      full_introduction: "הקדמה",
      content: {
        target_audience: [],
        benefits: [],
        process_steps: [],
        faq: [],
        cta_title: "",
        cta_text: "",
        cta_button_label: "",
        cta_link_type: "internal",
        cta_link_url: "/",
      },
      seo: { title: "", description: "" },
      status: "draft",
    })
    .select()
    .single();

  if (!service) {
    throw new Error("Failed to create service for status test");
  }

  // Test draft -> published
  const { error: publishError } = await supabase
    .from("services")
    .update({ status: "published" })
    .eq("id", service.id);

  if (publishError) {
    await supabase.from("services").delete().eq("id", service.id);
    throw new Error(`Failed to publish service: ${publishError.message}`);
  }

  // Test published -> archived
  const { error: archiveError } = await supabase
    .from("services")
    .update({ status: "archived" })
    .eq("id", service.id);

  if (archiveError) {
    await supabase.from("services").delete().eq("id", service.id);
    throw new Error(`Failed to archive service: ${archiveError.message}`);
  }

  // Test archived -> draft
  const { error: restoreError } = await supabase
    .from("services")
    .update({ status: "draft" })
    .eq("id", service.id);

  if (restoreError) {
    await supabase.from("services").delete().eq("id", service.id);
    throw new Error(`Failed to restore service: ${restoreError.message}`);
  }

  // Cleanup
  await supabase.from("services").delete().eq("id", service.id);

  return true;
}

async function main() {
  console.log("🚀 Starting Admin Functionality Tests\n");

  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD environment variables");
    console.log("Please set these in your .env.local file:");
    console.log("TEST_ADMIN_EMAIL=your-email@example.com");
    console.log("TEST_ADMIN_PASSWORD=your-password");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Login
  console.log("🔐 Logging in...");
  try {
    await login(supabase, email, password);
    console.log("✅ Login successful");
  } catch (error) {
    console.error("❌ Login failed:", error);
    process.exit(1);
  }

  // Run tests
  await runTest("Category Creation", () => testCategoryCreation(supabase));
  await runTest("Tag Creation", () => testTagCreation(supabase));
  await runTest("Service Creation", () => testServiceCreation(supabase));
  await runTest("Recipe Creation", () => testRecipeCreation(supabase));
  await runTest("Article Creation", () => testArticleCreation(supabase));
  await runTest("Press Article Creation", () => testPressCreation(supabase));
  await runTest("Slug Auto-Generation", () => testSlugAutoGeneration(supabase));
  await runTest("Status Transitions", () => testStatusTransitions(supabase));

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));

  const passed = testResults.filter((r) => r.success).length;
  const failed = testResults.filter((r) => !r.success).length;

  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    testResults
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
