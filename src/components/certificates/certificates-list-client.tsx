"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, Plus, RefreshCw } from "lucide-react";

import { reorderCertificatesAction } from "@/actions/certificates";
import { AdminListShell, AdminListToolbar } from "@/components/admin/admin-list-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { CertificateCard } from "@/components/certificates/certificate-card";
import { CertificateFormDialog } from "@/components/certificates/certificate-form-dialog";
import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import type {
  CertificateListItem,
  CertificatesPageData,
} from "@/lib/certificates/types";

type CertificatesListClientProps = {
  data: CertificatesPageData;
};

type FormState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; certificate: CertificateListItem };

export function CertificatesListClient({ data }: CertificatesListClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(data.items);
  const [updatedAt, setUpdatedAt] = useState(data.updatedAt);
  const [formState, setFormState] = useState<FormState>({ open: false });
  const [isRefreshing, startRefresh] = useTransition();
  const [isReordering, startReorder] = useTransition();
  const [liveMessage, setLiveMessage] = useState("");
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    open: false,
    variant: "success",
    message: "",
  });

  useEffect(() => {
    if (!liveMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLiveMessage("");
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [liveMessage]);

  const openCreateForm = () => {
    setFormState({ open: true, mode: "create" });
  };

  const openEditForm = (certificate: CertificateListItem) => {
    setFormState({ open: true, mode: "edit", certificate });
  };

  const closeForm = () => {
    setFormState({ open: false });
  };

  const handleSaved = (result: { id: string; updatedAt: string }) => {
    setUpdatedAt(result.updatedAt);
    setToast({
      open: true,
      variant: "success",
      message:
        formState.open && formState.mode === "create"
          ? "התעודה נוספה בהצלחה."
          : "התעודה עודכנה בהצלחה.",
    });
    router.refresh();
  };

  const handleDragStart = (index: number) => (event: React.DragEvent) => {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetIndex: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      sourceIndex >= items.length
    ) {
      return;
    }

    const nextItems = [...items];
    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    setItems(nextItems);

    const previousItems = items;
    const previousUpdatedAt = updatedAt;

    startReorder(async () => {
      const result = await reorderCertificatesAction({
        orderedIds: nextItems.map((item) => item.id),
        updatedAt: previousUpdatedAt,
      });

      if (!result.success) {
        setItems(previousItems);
        setToast({
          open: true,
          variant: "error",
          message: result.error,
        });
        return;
      }

      if (result.data?.updatedAt) {
        setUpdatedAt(result.data.updatedAt);
      }

      setLiveMessage("סדר התעודות עודכן");
      router.refresh();
    });
  };

  return (
    <AdminListShell>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      <AdminPageHeader
        module="certificates"
        title="תעודות והסמכות"
        description="ניהול התעודות וההסמכות המוצגות באתר"
        actionNode={
          <Button className="h-12 shrink-0 px-5" onClick={openCreateForm}>
            <Plus aria-hidden="true" className="size-4" />
            הוספת תעודה
          </Button>
        }
      />

      <AdminListToolbar countLabel={`${items.length} תעודות`}>
        <Button
          variant="outline"
          size="sm"
          loading={isRefreshing}
          onClick={() => startRefresh(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          רענון
        </Button>
      </AdminListToolbar>

      {items.length === 0 ? (
        <AdminEmptyState
          module="certificates"
          icon={Award}
          emoji="🎓"
          title="עדיין אין תעודות"
          description="הוסיפי תעודות והסמכות שיוצגו באתר ויחזקו את האמון המקצועי."
          action={
            <Button className="h-11 px-4" onClick={openCreateForm}>
              <Plus aria-hidden="true" className="size-4" />
              הוספת תעודה ראשונה
            </Button>
          }
        />
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-busy={isReordering}
        >
          {items.map((item, index) => (
            <CertificateCard
              key={item.id}
              item={item}
              index={index}
              updatedAt={updatedAt}
              onEdit={openEditForm}
              onUpdatedAtChange={setUpdatedAt}
              onDragStart={handleDragStart}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      <CertificateFormDialog
        open={formState.open}
        mode={formState.open ? formState.mode : "create"}
        certificate={
          formState.open && formState.mode === "edit"
            ? formState.certificate
            : undefined
        }
        updatedAt={updatedAt}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <FormToast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </AdminListShell>
  );
}
