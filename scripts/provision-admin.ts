import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_ADMIN = {
  email: "berkovich.yael@gmail.com",
  password: "1234",
  fullName: "יעל קנייבסקי",
} as const;

type AdminRow = {
  id: string;
  email: string | null;
  full_name: string;
};

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getSupabaseClient(): SupabaseClient {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function parseArgs(): {
  email: string;
  password: string;
  fullName: string;
} {
  const args = process.argv.slice(2);
  let email = DEFAULT_ADMIN.email;
  let password = DEFAULT_ADMIN.password;
  let fullName = DEFAULT_ADMIN.fullName;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--email" && next) {
      email = next.trim();
      index += 1;
      continue;
    }

    if (arg === "--password" && next) {
      password = next;
      index += 1;
      continue;
    }

    if (arg === "--name" && next) {
      fullName = next.trim();
      index += 1;
    }
  }

  return { email, password, fullName };
}

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ id: string; email: string | undefined } | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalized
    );

    if (match) {
      return { id: match.id, email: match.email };
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function provisionPrimaryAdmin(): Promise<void> {
  const { email, password, fullName } = parseArgs();
  const supabase = getSupabaseClient();

  const { data: existingAdmins, error: adminsError } = await supabase
    .from("admin_users")
    .select("id, email, full_name");

  if (adminsError) {
    throw new Error(`Failed to read admin_users: ${adminsError.message}`);
  }

  const currentAdmins = (existingAdmins ?? []) as AdminRow[];
  const existingAuthUser = await findAuthUserByEmail(supabase, email);

  let adminUserId: string;

  if (existingAuthUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingAuthUser.id,
      {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }
    );

    if (error || !data.user) {
      throw new Error(
        `Failed to update auth user: ${error?.message ?? "unknown error"}`
      );
    }

    adminUserId = data.user.id;
    console.log(`Updated existing auth user for ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error || !data.user) {
      throw new Error(
        `Failed to create auth user: ${error?.message ?? "unknown error"}`
      );
    }

    adminUserId = data.user.id;
    console.log(`Created auth user for ${email}`);
  }

  const { error: upsertError } = await supabase.from("admin_users").upsert(
    {
      id: adminUserId,
      full_name: fullName,
      email,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    throw new Error(`Failed to upsert admin_users row: ${upsertError.message}`);
  }

  console.log(`Provisioned admin_users row for ${fullName}`);

  for (const admin of currentAdmins) {
    if (admin.id === adminUserId) {
      continue;
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(admin.id);

    if (deleteError) {
      throw new Error(
        `Failed to remove previous admin ${admin.email ?? admin.id}: ${deleteError.message}`
      );
    }

    console.log(
      `Removed previous administrator: ${admin.full_name} (${admin.email ?? admin.id})`
    );
  }

  console.log("Primary administrator is ready.");
}

provisionPrimaryAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
