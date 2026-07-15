export type StoredSeo = {
  title: string;
  description: string;
  canonical_url: string | null;
};

export type ResolvedSeo = {
  title: string;
  description: string;
  canonical_url: string;
};
