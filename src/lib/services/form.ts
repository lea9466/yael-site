import {
  createDefaultServiceContent,
  createDefaultServiceSeo,
} from "@/lib/services/content";
import type { ServiceDetail } from "@/lib/services/types";
import type { ServiceDraftInput } from "@/lib/validations/service";

export function serviceDetailToFormInput(
  service: ServiceDetail
): ServiceDraftInput {
  return {
    title: service.title,
    slug: service.slug,
    short_description: service.short_description,
    full_introduction: service.full_introduction,
    cover_media_id: service.cover_media_id,
    seo_og_media_id: service.seo_og_media_id,
    featured: service.featured,
    status: service.status,
    content: service.content ?? createDefaultServiceContent(),
    seo: service.seo ?? createDefaultServiceSeo(),
  };
}

export function createEmptyServiceFormInput(): ServiceDraftInput {
  return {
    title: "",
    slug: "",
    short_description: "",
    full_introduction: "",
    cover_media_id: null,
    seo_og_media_id: null,
    featured: false,
    status: "draft",
    content: createDefaultServiceContent(),
    seo: createDefaultServiceSeo(),
  };
}
