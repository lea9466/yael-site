"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  submitPublicContactAction,
  type PublicContactFieldErrors,
} from "@/actions/public-contact";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import type { PublicContactLinks } from "@/lib/contact/public-links";
import {
  PUBLIC_CONTACT_EMAIL_MAX,
  PUBLIC_CONTACT_FULL_NAME_MAX,
  PUBLIC_CONTACT_MESSAGE_MAX,
  PUBLIC_CONTACT_PHONE_MAX,
  publicContactFormSchema,
  type PublicContactFormValues,
} from "@/lib/validations/public-contact";

type ContactFormProps = {
  links: PublicContactLinks;
};

const FIELD_ORDER = [
  "full_name",
  "email",
  "phone",
  "message",
  "privacy_policy_accepted",
] as const;

export function ContactForm({ links }: ContactFormProps) {
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const privacyRef = useRef<HTMLInputElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PublicContactFormValues>({
    resolver: zodResolver(publicContactFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      message: "",
      privacy_policy_accepted: false,
    },
  });

  const fullNameRegister = register("full_name");
  const emailRegister = register("email");
  const phoneRegister = register("phone");
  const messageRegister = register("message");

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  function applyFieldErrors(fieldErrors: PublicContactFieldErrors) {
    for (const key of FIELD_ORDER) {
      const message = fieldErrors[key];

      if (message) {
        setError(key, { type: "server", message });
      }
    }

    const firstInvalid = FIELD_ORDER.find((key) => fieldErrors[key]);

    if (firstInvalid === "full_name") {
      fullNameRef.current?.focus();
    } else if (firstInvalid === "email") {
      emailRef.current?.focus();
    } else if (firstInvalid === "phone") {
      phoneRef.current?.focus();
    } else if (firstInvalid === "message") {
      messageRef.current?.focus();
    } else if (firstInvalid === "privacy_policy_accepted") {
      privacyRef.current?.focus();
    }
  }

  const onSubmit = handleSubmit((values, event) => {
    if (isPending || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const formElement = event?.target;
    const honeypotValue =
      formElement instanceof HTMLFormElement
        ? String(new FormData(formElement).get("company_website") ?? "")
        : "";

    startTransition(async () => {
      try {
        const result = await submitPublicContactAction({
          ...values,
          company_website: honeypotValue,
        });

        if (!result.success) {
          if (result.fieldErrors) {
            applyFieldErrors(result.fieldErrors);
          }

          setFormError(result.error);
          return;
        }

        setSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    });
  });

  if (submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="contact-page__success"
        role="status"
        aria-live="polite"
      >
        <div className="contact-page__success-icon-wrap" aria-hidden="true">
          <CheckCircle2 className="contact-page__success-icon" />
        </div>
        <h2 className="contact-page__success-title">ההודעה נשלחה בהצלחה</h2>
        <p className="contact-page__success-text">
          תודה שפנית. ההודעה התקבלה וניתן לחזור אלייך לפי הפרטים שהשארת.
        </p>
        <div className="contact-page__success-actions">
          <Link href="/" className="contact-page__primary-link public-focus-ring">
            חזרה לעמוד הבית
          </Link>
          {links.whatsappHref ? (
            <a
              href={links.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-page__secondary-link public-focus-ring"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              וואטסאפ
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const fullNameErrorId = `${formId}-full-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const phoneErrorId = `${formId}-phone-error`;
  const messageErrorId = `${formId}-message-error`;
  const privacyErrorId = `${formId}-privacy-error`;
  const formErrorId = `${formId}-form-error`;

  return (
    <form
      className="contact-page__form"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={formError ? formErrorId : undefined}
    >
      <div className="contact-page__form-header">
        <h2 className="contact-page__form-title">השאירו פרטים</h2>
        <p className="contact-page__form-intro">
          מלאו את הטופס ואחזור אליכם בהקדם. אין צורך לכתוב מידע רפואי או רגיש
          בטופס זה.
        </p>
      </div>

      {formError ? (
        <div
          id={formErrorId}
          role="alert"
          aria-live="assertive"
          className="contact-page__form-alert"
        >
          <p>{formError}</p>
          {(links.phoneHref || links.whatsappHref) && (
            <p className="contact-page__form-alert-links">
              {links.phoneHref ? (
                <a href={links.phoneHref} className="public-focus-ring">
                  התקשרות
                </a>
              ) : null}
              {links.phoneHref && links.whatsappHref ? (
                <span aria-hidden="true"> · </span>
              ) : null}
              {links.whatsappHref ? (
                <a
                  href={links.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-focus-ring"
                >
                  וואטסאפ
                </a>
              ) : null}
            </p>
          )}
        </div>
      ) : null}

      <FormField
        label="שם מלא"
        htmlFor={`${formId}-full-name`}
        required
        error={errors.full_name?.message}
        errorId={fullNameErrorId}
      >
        <Input
          id={`${formId}-full-name`}
          type="text"
          autoComplete="name"
          placeholder="השם שלכם"
          maxLength={PUBLIC_CONTACT_FULL_NAME_MAX}
          error={Boolean(errors.full_name)}
          aria-invalid={Boolean(errors.full_name) || undefined}
          aria-describedby={
            errors.full_name ? fullNameErrorId : undefined
          }
          {...fullNameRegister}
          ref={(element) => {
            fullNameRegister.ref(element);
            fullNameRef.current = element;
          }}
        />
      </FormField>

      <FormField
        label="אימייל"
        htmlFor={`${formId}-email`}
        required
        error={errors.email?.message}
        errorId={emailErrorId}
      >
        <Input
          id={`${formId}-email`}
          type="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          placeholder="name@example.com"
          maxLength={PUBLIC_CONTACT_EMAIL_MAX}
          className="text-left"
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? emailErrorId : undefined}
          {...emailRegister}
          ref={(element) => {
            emailRegister.ref(element);
            emailRef.current = element;
          }}
        />
      </FormField>

      <FormField
        label="טלפון"
        htmlFor={`${formId}-phone`}
        hint="אופציונלי"
        error={errors.phone?.message}
        errorId={phoneErrorId}
      >
        <Input
          id={`${formId}-phone`}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="050-0000000"
          maxLength={PUBLIC_CONTACT_PHONE_MAX}
          className="text-left"
          error={Boolean(errors.phone)}
          aria-invalid={Boolean(errors.phone) || undefined}
          aria-describedby={errors.phone ? phoneErrorId : undefined}
          {...phoneRegister}
          ref={(element) => {
            phoneRegister.ref(element);
            phoneRef.current = element;
          }}
        />
      </FormField>

      <FormField
        label="הודעה"
        htmlFor={`${formId}-message`}
        required
        error={errors.message?.message}
        errorId={messageErrorId}
      >
        <AutoResizeTextarea
          id={`${formId}-message`}
          placeholder="ספרו בקצרה במה אוכל לעזור"
          maxLength={PUBLIC_CONTACT_MESSAGE_MAX}
          minHeightPx={140}
          maxHeightPx={320}
          className="min-h-[140px]"
          error={Boolean(errors.message)}
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={errors.message ? messageErrorId : undefined}
          {...messageRegister}
          ref={(element) => {
            messageRegister.ref(element);
            messageRef.current = element;
          }}
        />
      </FormField>

      <div className="contact-page__privacy">
        <Controller
          name="privacy_policy_accepted"
          control={control}
          render={({ field }) => (
            <label
              htmlFor={`${formId}-privacy`}
              className="contact-page__privacy-label"
            >
              <Checkbox
                id={`${formId}-privacy`}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={(element) => {
                  field.ref(element);
                  privacyRef.current = element;
                }}
                aria-invalid={
                  Boolean(errors.privacy_policy_accepted) || undefined
                }
                aria-describedby={
                  errors.privacy_policy_accepted ? privacyErrorId : undefined
                }
              />
              <span>
                קראתי ואני מסכימ/ה ל
                <Link
                  href="/privacy"
                  className="contact-page__privacy-link public-focus-ring"
                >
                  מדיניות הפרטיות
                </Link>
              </span>
            </label>
          )}
        />
        {errors.privacy_policy_accepted ? (
          <p
            id={privacyErrorId}
            role="alert"
            className="contact-page__field-error"
          >
            {errors.privacy_policy_accepted.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot — hidden from assistive tech and sighted users */}
      <div className="contact-page__honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-company-website`}>
          אתר החברה
          <input
            id={`${formId}-company-website`}
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={isPending || isSubmitting}
        className="contact-page__submit"
        disabled={isPending || isSubmitting}
      >
        {isPending || isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            שולחים...
          </>
        ) : (
          "שליחת הודעה"
        )}
      </Button>
    </form>
  );
}
