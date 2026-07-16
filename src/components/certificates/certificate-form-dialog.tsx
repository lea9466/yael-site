"use client";

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  addCertificateAction,
  updateCertificateAction,
} from "@/actions/certificates";
import { ServiceMediaPicker } from "@/components/services/service-media-picker";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CERTIFICATE_DESCRIPTION_MAX,
  CERTIFICATE_ORGANIZATION_MAX,
  CERTIFICATE_TITLE_MAX,
} from "@/lib/certificates/constants";
import { formatCertificateYear } from "@/lib/certificates/format";
import type {
  CertificateFormValues,
  CertificateListItem,
} from "@/lib/certificates/types";
import { focusRepeaterItemFirstField } from "@/lib/forms/repeater-autofocus";
import {
  certificateFormInputSchema,
  mapZodErrors,
} from "@/lib/validations/certificate";

type CertificateFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  certificate?: CertificateListItem;
  updatedAt: string;
  onClose: () => void;
  onSaved: (result: { id: string; updatedAt: string }) => void;
};

const EMPTY_VALUES: CertificateFormValues = {
  title: "",
  organization: "",
  year: "",
  media_id: null,
  description: "",
};

function buildInitialValues(
  certificate: CertificateListItem | undefined
): CertificateFormValues {
  if (!certificate) {
    return EMPTY_VALUES;
  }

  return {
    title: certificate.title,
    organization: certificate.organization,
    year: formatCertificateYear(certificate.year),
    media_id: certificate.media_id,
    description: certificate.description ?? "",
  };
}

type CertificateFormBodyProps = {
  mode: "create" | "edit";
  certificate?: CertificateListItem;
  updatedAt: string;
  autofocus: boolean;
  onClose: () => void;
  onSaved: (result: { id: string; updatedAt: string }) => void;
  onPendingChange: (pending: boolean) => void;
};

function CertificateFormBody({
  mode,
  certificate,
  updatedAt,
  autofocus,
  onClose,
  onSaved,
  onPendingChange,
}: CertificateFormBodyProps) {
  const formId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const initialValues = useMemo(
    () => buildInitialValues(certificate),
    [certificate]
  );
  const [values, setValues] = useState(initialValues);
  const [mediaPreview, setMediaPreview] = useState(
    certificate?.mediaPreview ?? null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  useLayoutEffect(() => {
    if (!autofocus || !bodyRef.current) {
      return;
    }

    focusRepeaterItemFirstField(bodyRef.current);
  }, [autofocus]);

  const setField = <K extends keyof CertificateFormValues>(
    key: K,
    value: CertificateFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    if (isPending || !values.media_id) {
      if (!values.media_id) {
        setFieldErrors((current) => ({
          ...current,
          media_id: "יש לבחור תמונת תעודה",
        }));
      }

      return;
    }

    const payload = {
      title: values.title,
      organization: values.organization,
      year: values.year,
      media_id: values.media_id,
      description: values.description,
      updatedAt,
    };

    const clientParsed = certificateFormInputSchema.safeParse(payload);

    if (!clientParsed.success) {
      setFieldErrors(mapZodErrors(clientParsed.error));
      setFormError("יש לתקן את השדות המסומנים.");
      return;
    }

    startTransition(async () => {
      setFieldErrors({});
      setFormError("");

      const result =
        mode === "create"
          ? await addCertificateAction(payload)
          : await updateCertificateAction({
              ...payload,
              id: certificate?.id ?? "",
            });

      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (result.data) {
        onSaved(result.data);
      }

      onClose();
    });
  };

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return (
    <>
      <div ref={bodyRef} className="space-y-6">
        <ServiceMediaPicker
          fieldId={`${formId}-media`}
          label="תמונת תעודה"
          description="בחרו תמונה מספריית המדיה או העלו תמונה חדשה."
          required
          value={values.media_id}
          preview={
            mediaPreview
              ? {
                  id: mediaPreview.id,
                  url: mediaPreview.url,
                  alt: mediaPreview.alt,
                }
              : null
          }
          error={fieldErrors.media_id}
          onChange={(mediaId, preview) => {
            setField("media_id", mediaId);
            setMediaPreview(
              preview
                ? {
                    id: preview.id,
                    url: preview.url,
                    alt: preview.alt,
                  }
                : null
            );
          }}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            htmlFor={`${formId}-title`}
            label="כותרת"
            required
            error={fieldErrors.title}
          >
            <Input
              id={`${formId}-title`}
              value={values.title}
              maxLength={CERTIFICATE_TITLE_MAX}
              placeholder="לדוגמה: ייעוץ תזונה קלינית"
              error={Boolean(fieldErrors.title)}
              onChange={(event) => setField("title", event.target.value)}
            />
          </FormField>

          <FormField
            htmlFor={`${formId}-organization`}
            label="ארגון מעניק"
            required
            error={fieldErrors.organization}
          >
            <Input
              id={`${formId}-organization`}
              value={values.organization}
              maxLength={CERTIFICATE_ORGANIZATION_MAX}
              placeholder="לדוגמה: משרד הבריאות"
              error={Boolean(fieldErrors.organization)}
              onChange={(event) => setField("organization", event.target.value)}
            />
          </FormField>
        </div>

        <FormField
          htmlFor={`${formId}-year`}
          label="שנת הסמכה"
          hint="אופציונלי"
          error={fieldErrors.year}
        >
          <Input
            id={`${formId}-year`}
            value={values.year}
            inputMode="numeric"
            placeholder="לדוגמה: 2022"
            maxLength={4}
            error={Boolean(fieldErrors.year)}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 4);
              setField("year", nextValue);
            }}
          />
        </FormField>

        <FormField
          htmlFor={`${formId}-description`}
          label="תיאור"
          hint="אופציונלי — ניתן להוסיף שורות חדשות"
          error={fieldErrors.description}
        >
          <Textarea
            id={`${formId}-description`}
            value={values.description}
            maxLength={CERTIFICATE_DESCRIPTION_MAX}
            placeholder="פרטים נוספים על ההסמכה..."
            className="min-h-32 text-base leading-[var(--line-height-relaxed)]"
            error={Boolean(fieldErrors.description)}
            onChange={(event) => setField("description", event.target.value)}
          />
        </FormField>

        {formError ? (
          <p role="alert" className="text-sm text-[var(--color-error)]">
            {formError}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          ביטול
        </Button>
        <Button
          loading={isPending}
          loadingText="שומרת..."
          disabled={!isDirty && mode === "edit"}
          onClick={handleSubmit}
        >
          שמירה
        </Button>
      </div>
    </>
  );
}

export function CertificateFormDialog({
  open,
  mode,
  certificate,
  updatedAt,
  onClose,
  onSaved,
}: CertificateFormDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const formInstanceKey =
    mode === "edit" && certificate ? certificate.id : "create";

  const dialogTitle =
    mode === "create" ? "הוספת תעודה" : "עריכת תעודה";
  const dialogDescription =
    mode === "create"
      ? "הוסיפי תעודה או הסמכה שתוצג באתר."
      : "עדכני את פרטי התעודה והתמונה המוצגת.";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
      description={dialogDescription}
      disableEscapeClose={isPending}
      panelClassName="max-h-[min(92dvh,860px)] w-[min(920px,calc(100vw-32px))]"
      bodyClassName="overflow-y-auto"
    >
      {open ? (
        <CertificateFormBody
          key={formInstanceKey}
          mode={mode}
          certificate={certificate}
          updatedAt={updatedAt}
          autofocus={mode === "create"}
          onClose={onClose}
          onSaved={onSaved}
          onPendingChange={setIsPending}
        />
      ) : null}
    </Dialog>
  );
}
