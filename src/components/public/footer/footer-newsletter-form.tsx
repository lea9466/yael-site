"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  submitNewsletterSignupAction,
  type NewsletterSignupFieldErrors,
} from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { markNewsletterSubscribed } from "@/lib/newsletter/popup-storage";
import {
  NEWSLETTER_EMAIL_MAX,
  NEWSLETTER_FULL_NAME_MAX,
  newsletterSignupFormSchema,
  type NewsletterSignupFormValues,
} from "@/lib/validations/newsletter";

const EMPTY_VALUES: NewsletterSignupFormValues = {
  full_name: "",
  email: "",
  marketing_consent: false,
};

export function FooterNewsletterForm() {
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const consentRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NewsletterSignupFormValues>({
    resolver: zodResolver(newsletterSignupFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const fullNameRegister = register("full_name");
  const emailRegister = register("email");

  function applyFieldErrors(fieldErrors: NewsletterSignupFieldErrors) {
    if (fieldErrors.full_name) {
      setError("full_name", { type: "server", message: fieldErrors.full_name });
    }

    if (fieldErrors.email) {
      setError("email", { type: "server", message: fieldErrors.email });
    }

    if (fieldErrors.marketing_consent) {
      setError("marketing_consent", {
        type: "server",
        message: fieldErrors.marketing_consent,
      });
    }

    if (fieldErrors.full_name) {
      fullNameRef.current?.focus();
    } else if (fieldErrors.email) {
      emailRef.current?.focus();
    } else if (fieldErrors.marketing_consent) {
      consentRef.current?.focus();
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
        const result = await submitNewsletterSignupAction({
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

        markNewsletterSubscribed();
        setSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    });
  });

  if (submitted) {
    return (
      <div className="footer-newsletter footer-newsletter--success" role="status" aria-live="polite">
        <Heart aria-hidden="true" fill="currentColor" className="footer-newsletter__success-icon" />
        <p className="footer-newsletter__success-text">
          נרשמת בהצלחה! תודה שהצטרפת — התוכן הראשון בדרך אלייך.
        </p>
      </div>
    );
  }

  const fieldOrError =
    formError || errors.full_name?.message || errors.email?.message || errors.marketing_consent?.message;
  const fullNameErrorId = `${formId}-full-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const consentErrorId = `${formId}-consent-error`;
  const formErrorId = `${formId}-form-error`;

  return (
    <div className="footer-newsletter">
      <div className="footer-newsletter__copy">
        <p className="footer-newsletter__title">
          משהו טוב מחכה לך{" "}
          <Heart aria-hidden="true" fill="currentColor" className="footer-newsletter__title-icon" />
        </p>
        <p className="footer-newsletter__text">
          תוכן קצר, מחשבות וכלים למערכת יחסים בריאה ונינוחה יותר עם אוכל.
        </p>
      </div>

      <form
        className="footer-newsletter__form"
        onSubmit={onSubmit}
        noValidate
        aria-describedby={fieldOrError ? formErrorId : undefined}
      >
        <div className="footer-newsletter__fields">
          <label className="sr-only" htmlFor={`${formId}-full-name`}>
            שם מלא
          </label>
          <input
            id={`${formId}-full-name`}
            type="text"
            autoComplete="name"
            placeholder="השם שלך"
            maxLength={NEWSLETTER_FULL_NAME_MAX}
            className="footer-newsletter__field"
            aria-invalid={Boolean(errors.full_name) || undefined}
            aria-describedby={errors.full_name ? fullNameErrorId : undefined}
            {...fullNameRegister}
            ref={(element) => {
              fullNameRegister.ref(element);
              fullNameRef.current = element;
            }}
          />

          <label className="sr-only" htmlFor={`${formId}-email`}>
            אימייל
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            placeholder="האימייל שלך"
            maxLength={NEWSLETTER_EMAIL_MAX}
            className="footer-newsletter__field"
            style={{ textAlign: "right" }}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            {...emailRegister}
            ref={(element) => {
              emailRegister.ref(element);
              emailRef.current = element;
            }}
          />

          <Button
            type="submit"
            className="footer-newsletter__submit"
            loading={isPending || isSubmitting}
            disabled={isPending || isSubmitting}
          >
            {isPending || isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              "אני רוצה לקבל"
            )}
          </Button>
        </div>

        <Controller
          name="marketing_consent"
          control={control}
          render={({ field }) => (
            <label htmlFor={`${formId}-consent`} className="footer-newsletter__consent">
              <Checkbox
                id={`${formId}-consent`}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={(element) => {
                  field.ref(element);
                  consentRef.current = element;
                }}
                aria-invalid={Boolean(errors.marketing_consent) || undefined}
                aria-describedby={
                  errors.marketing_consent ? consentErrorId : undefined
                }
              />
              <span>
                מאשר/ת קבלת דיוור שיווקי מיעל קנייבסקי, בהתאם ל
                <Link href="/privacy-policy" className="footer-newsletter__link">
                  מדיניות הפרטיות
                </Link>
                .
              </span>
            </label>
          )}
        />

        {fieldOrError ? (
          <p
            id={
              formError
                ? formErrorId
                : errors.full_name
                  ? fullNameErrorId
                  : errors.email
                    ? emailErrorId
                    : consentErrorId
            }
            role="alert"
            className="footer-newsletter__error"
          >
            {fieldOrError}
          </p>
        ) : null}

        {/* Honeypot — hidden from assistive tech and sighted users */}
        <div className="footer-newsletter__honeypot" aria-hidden="true">
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
      </form>
    </div>
  );
}
