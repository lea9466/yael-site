import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from .env.local
function loadEnvFile(): Record<string, string> {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local file not found");
  }

  const envContent = readFileSync(envPath, "utf-8");
  const envVars: Record<string, string> = {};

  for (const line of envContent.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const [key, ...valueParts] = trimmedLine.split("=");
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  }

  return envVars;
}

async function provisionYaelAdmin() {
  console.log("🚀 Starting Yael admin provisioning...\n");

  const env = loadEnvFile();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  // Create service role client (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Yael's details
  const yaelEmail = "berkovich.yael@gmail.com";
  const yaelPassword = "1234";
  const yaelFullName = "יעל קנייבסקי";

  console.log("📋 Configuration:");
  console.log(`  Email: ${yaelEmail}`);
  console.log(`  Name: ${yaelFullName}`);
  console.log(`  Password: ${yaelPassword}\n`);

  try {
    // Step 1: Check for existing admin users
    console.log("🔍 Checking existing admin users...");
    const { data: existingAdmins, error: adminError } = await supabase
      .from("admin_users")
      .select("id, full_name, email");

    if (adminError) {
      throw new Error(`Failed to fetch existing admins: ${adminError.message}`);
    }

    console.log(`  Found ${existingAdmins.length} existing admin(s):`);
    existingAdmins.forEach((admin) => {
      console.log(`    - ${admin.full_name} (${admin.email || "no email"}) - ID: ${admin.id}`);
    });
    console.log();

    // Step 2: Check if Yael already exists in auth
    console.log("🔍 Checking if Yael exists in Supabase Auth...");
    const { data: existingUsers, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }

    const yaelAuthUser = existingUsers.users.find((u) => u.email === yaelEmail);
    console.log(`  Yael in Auth: ${yaelAuthUser ? "✅ Found" : "❌ Not found"}`);
    console.log();

    // Step 3: Create or update Yael's auth user
    let yaelAuthId: string;

    if (yaelAuthUser) {
      console.log("🔄 Updating Yael's password in Auth...");
      yaelAuthId = yaelAuthUser.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(yaelAuthId, {
        password: yaelPassword,
      });

      if (updateError) {
        throw new Error(`Failed to update Yael's password: ${updateError.message}`);
      }
      console.log("  ✅ Password updated\n");
    } else {
      console.log("➕ Creating Yael in Supabase Auth...");
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: yaelEmail,
        password: yaelPassword,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Failed to create Yael in Auth: ${createError.message}`);
      }

      yaelAuthId = newAuthUser.user.id;
      console.log(`  ✅ Created with ID: ${yaelAuthId}\n`);
    }

    // Step 4: Create or update Yael's admin_users row
    console.log("📝 Updating admin_users table...");
    const { data: yaelAdminRow, error: yaelAdminError } = await supabase
      .from("admin_users")
      .upsert(
        {
          id: yaelAuthId,
          full_name: yaelFullName,
          email: yaelEmail,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (yaelAdminError) {
      throw new Error(`Failed to upsert Yael admin: ${yaelAdminError.message}`);
    }

    console.log(`  ✅ Admin user updated: ${yaelAdminRow.full_name}\n`);

    // Step 5: Remove old admin(s) (excluding Yael)
    const oldAdmins = existingAdmins.filter((admin) => admin.id !== yaelAuthId);

    if (oldAdmins.length > 0) {
      console.log(`🗑️  Removing ${oldAdmins.length} old admin(s)...`);
      for (const oldAdmin of oldAdmins) {
        console.log(`  Removing: ${oldAdmin.full_name} (${oldAdmin.email || "no email"})`);

        // Delete from admin_users first (cascades to auth.users via FK)
        const { error: deleteAdminError } = await supabase
          .from("admin_users")
          .delete()
          .eq("id", oldAdmin.id);

        if (deleteAdminError) {
          console.error(`    ⚠️  Failed to delete admin_users row: ${deleteAdminError.message}`);
        } else {
          console.log(`    ✅ Deleted from admin_users`);
        }

        // Also delete from auth.users (in case FK didn't cascade or for cleanup)
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(oldAdmin.id);
        if (deleteAuthError) {
          console.error(`    ⚠️  Failed to delete from auth: ${deleteAuthError.message}`);
        } else {
          console.log(`    ✅ Deleted from auth.users`);
        }
      }
      console.log();
    } else {
      console.log("✅ No old admins to remove\n");
    }

    // Step 6: Update business profile email to match
    console.log("📧 Updating business profile email...");
    const { data: businessProfile, error: bpError } = await supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("key", "business_profile")
      .single();

    if (bpError) {
      console.error(`  ⚠️  Failed to fetch business profile: ${bpError.message}`);
    } else {
      const currentEmail = businessProfile.data?.email;
      if (currentEmail !== yaelEmail) {
        const { error: updateBpError } = await supabase
          .from("site_content")
          .update({
            data: {
              ...businessProfile.data,
              email: yaelEmail,
            },
          })
          .eq("key", "business_profile");

        if (updateBpError) {
          console.error(`  ⚠️  Failed to update business profile email: ${updateBpError.message}`);
        } else {
          console.log(`  ✅ Updated business profile email from "${currentEmail}" to "${yaelEmail}"`);
        }
      } else {
        console.log(`  ✅ Business profile email already matches`);
      }
    }
    console.log();

    console.log("✅ Provisioning completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`  - Yael (${yaelEmail}) is now the primary admin`);
    console.log(`  - Login with: ${yaelEmail} / ${yaelPassword}`);
    console.log(`  - Old admin(s) removed`);
    console.log(`  - Business profile email synchronized`);

  } catch (error) {
    console.error("\n❌ Provisioning failed:", error);
    process.exit(1);
  }
}

// Run the provisioning
provisionYaelAdmin();
