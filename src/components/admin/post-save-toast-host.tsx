"use client";

import dynamic from "next/dynamic";

const PostSaveToastListener = dynamic(
  () =>
    import("@/components/admin/post-save-toast-listener").then(
      (module) => module.PostSaveToastListener
    ),
  { ssr: false }
);

export function PostSaveToastHost() {
  return <PostSaveToastListener />;
}
