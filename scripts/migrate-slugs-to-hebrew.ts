import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { classifySlugForMigration } from "../src/lib/slug/migration";
import { buildUniqueSlug } from "../src/lib/slug/hebrew-slug";

type SlugRecord = {
  id: string;
  title: string;
  slug: string;
};

type TaxonomyRecord = SlugRecord & {
  type: string;
};

type MigrationTable = {
  name: string;
  table: string;
  titleColumn: "title" | "name";
  fallback: string;
  scopedByType?: boolean;
};

const MIGRATION_TABLES: MigrationTable[] = [
  {
    name: "services",
    table: "services",
    titleColumn: "title",
    fallback: "service",
  },
  {
    name: "recipes",
    table: "recipes",
    titleColumn: "title",
    fallback: "recipe",
  },
  {
    name: "articles",
    table: "articles",
    titleColumn: "title",
    fallback: "article",
  },
  {
    name: "categories",
    table: "categories",
    titleColumn: "name",
    fallback: "category",
    scopedByType: true,
  },
  {
    name: "tags",
    table: "tags",
    titleColumn: "name",
    fallback: "tag",
    scopedByType: true,
  },
];

type MigrationReportRow = {
  table: string;
  id: string;
  title: string;
  currentSlug: string;
  newSlug?: string;
  action: "migrate" | "skip";
  reason: string;
};

type MigrationSummary = {
  table: string;
  total: number;
  toMigrate: number;
  alreadyHebrew: number;
  manualLatin: number;
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
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getSupabaseClient() {
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

async function fetchRecords(
  table: MigrationTable
): Promise<Array<SlugRecord | TaxonomyRecord>> {
  const supabase = getSupabaseClient();
  const columns = table.scopedByType
    ? `id, ${table.titleColumn}, slug, type`
    : `id, ${table.titleColumn}, slug`;

  const { data, error } = await supabase.from(table.table).select(columns);

  if (error) {
    throw new Error(`Failed to fetch ${table.name}: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const record = row as unknown as Record<string, string>;

    return {
      id: record.id,
      title: record[table.titleColumn],
      slug: record.slug,
      ...(table.scopedByType ? { type: record.type } : {}),
    };
  });
}

function buildTakenChecker(
  table: MigrationTable,
  records: Array<SlugRecord | TaxonomyRecord>,
  pendingUpdates: Map<string, string>
) {
  const existingSlugs = new Set(records.map((record) => record.slug));

  return async (slug: string, excludeId: string, type?: string): Promise<boolean> => {
    for (const [recordId, nextSlug] of pendingUpdates.entries()) {
      if (recordId === excludeId) {
        continue;
      }

      if (table.scopedByType) {
        const record = records.find((item) => item.id === recordId) as TaxonomyRecord | undefined;

        if (record?.type !== type) {
          continue;
        }
      }

      if (nextSlug === slug) {
        return true;
      }
    }

    for (const record of records) {
      if (record.id === excludeId) {
        continue;
      }

      if (table.scopedByType && (record as TaxonomyRecord).type !== type) {
        continue;
      }

      if (record.slug === slug) {
        return true;
      }
    }

    return existingSlugs.has(slug);
  };
}

async function buildReport(): Promise<{
  rows: MigrationReportRow[];
  summaries: MigrationSummary[];
}> {
  const rows: MigrationReportRow[] = [];
  const summaries: MigrationSummary[] = [];

  for (const table of MIGRATION_TABLES) {
    const records = await fetchRecords(table);
    const pendingUpdates = new Map<string, string>();
    const isTaken = buildTakenChecker(table, records, pendingUpdates);

    let toMigrate = 0;
    let alreadyHebrew = 0;
    let manualLatin = 0;

    for (const record of records) {
      const decision = classifySlugForMigration({
        slug: record.slug,
        title: record.title,
        fallback: table.fallback,
      });

      if (decision.action === "skip") {
        if (decision.reason === "already_hebrew") {
          alreadyHebrew += 1;
        } else {
          manualLatin += 1;
        }

        rows.push({
          table: table.name,
          id: record.id,
          title: record.title,
          currentSlug: record.slug,
          action: "skip",
          reason: decision.reason,
        });
        continue;
      }

      let newSlug = decision.newSlug;
      const type = table.scopedByType
        ? (record as TaxonomyRecord).type
        : undefined;

      if (await isTaken(newSlug, record.id, type)) {
        newSlug = await buildUniqueSlug(newSlug, (candidate) =>
          isTaken(candidate, record.id, type)
        );
      }

      pendingUpdates.set(record.id, newSlug);
      toMigrate += 1;

      rows.push({
        table: table.name,
        id: record.id,
        title: record.title,
        currentSlug: record.slug,
        newSlug,
        action: "migrate",
        reason: decision.reason,
      });
    }

    summaries.push({
      table: table.name,
      total: records.length,
      toMigrate,
      alreadyHebrew,
      manualLatin,
    });
  }

  return { rows, summaries };
}

async function applyMigration(rows: MigrationReportRow[]): Promise<void> {
  const supabase = getSupabaseClient();
  const updates = rows.filter((row) => row.action === "migrate" && row.newSlug);

  for (const row of updates) {
    const { error } = await supabase
      .from(row.table)
      .update({ slug: row.newSlug })
      .eq("id", row.id);

    if (error) {
      throw new Error(
        `Failed to update ${row.table}/${row.id}: ${error.message}`
      );
    }
  }
}

function printReport(
  rows: MigrationReportRow[],
  summaries: MigrationSummary[],
  apply: boolean
): void {
  console.log(apply ? "Applying Hebrew slug migration..." : "Dry run: Hebrew slug migration");
  console.log("");
  console.log("Detection rules:");
  console.log("- already_hebrew: slug contains Hebrew letters → unchanged");
  console.log(
    "- manual_latin: Latin slug whose base does not match legacy auto-generation from title → unchanged"
  );
  console.log(
    "- auto_latin: Latin slug matching legacy auto-generation from title (including -2/-3/-copy suffixes) → migrated"
  );
  console.log("");

  for (const summary of summaries) {
    console.log(
      `${summary.table}: total=${summary.total}, migrate=${summary.toMigrate}, already_hebrew=${summary.alreadyHebrew}, manual_latin=${summary.manualLatin}`
    );
  }

  console.log("");
  console.log("Planned updates:");

  for (const row of rows) {
    if (row.action !== "migrate") {
      continue;
    }

    console.log(
      `[${row.table}] ${row.currentSlug} → ${row.newSlug} (${row.title})`
    );
  }

  console.log("");
  console.log("Skipped records:");

  for (const row of rows) {
    if (row.action !== "skip") {
      continue;
    }

    console.log(`[${row.table}] ${row.currentSlug} (${row.reason})`);
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const { rows, summaries } = await buildReport();

  printReport(rows, summaries, apply);

  if (!apply) {
    console.log("");
    console.log("Dry run complete. Re-run with --apply to update the database.");
    return;
  }

  await applyMigration(rows);
  console.log("");
  console.log(`Updated ${rows.filter((row) => row.action === "migrate").length} records.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
