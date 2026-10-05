"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";

import {
  submitNewsletterSignupAction,
  type NewsletterSignupFieldErrors,
} from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import {
  markNewsletterSubscribed,
  readNewsletterStoredState,
  shouldOfferNewsletterSignup,
  writeNewsletterStoredState,
} from "@/lib/newsletter/popup-storage";
import { getPortalRoot } from "@/lib/portal/get-portal-root";
import {
  NEWSLETTER_EMAIL_MAX,
  NEWSLETTER_FULL_NAME_MAX,
  newsletterSignupFormSchema,
  type NewsletterSignupFormValues,
} from "@/lib/validations/newsletter";

const IDLE_DELAY_MS = 16000;
const SCROLL_THRESHOLD_PX = 480;
const SUCCESS_AUTO_HIDE_MS = 5000;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const EMPTY_VALUES: NewsletterSignupFormValues = {
  full_name: "",
  email: "",
  marketing_consent: false,
};

export function NewsletterPopup() {
  const formId = useId();
  const isClientReady = useClientReady();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<"hidden" | "visible" | "success">("hidden");
  const [formError, setFormError] = useState("");
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const consentRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!shouldOfferNewsletterSignup()) {
      return;
    }

    let revealed = false;

    function reveal() {
      if (revealed) {
        return;
      }

      revealed = true;
      setPhase("visible");
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
    }

    function handleScroll() {
      if (window.scrollY > SCROLL_THRESHOLD_PX) {
        reveal();
      }
    }

    const idleTimer = window.setTimeout(reveal, IDLE_DELAY_MS);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
    };
  }, []);

  // While the card is up (form or success), block background scroll, trap
  // Tab inside the panel, and restore focus to whatever was focused before
  // it opened — it now sits over a backdrop, so it reads as a real dialog.
  useEffect(() => {
    if (phase === "hidden") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];

    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "success") {
      return;
    }

    const timer = window.setTimeout(() => setPhase("hidden"), SUCCESS_AUTO_HIDE_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  function dismiss() {
    setPhase("hidden");
    writeNewsletterStoredState({
      ...readNewsletterStoredState(),
      dismissedAt: Date.now(),
    });
  }

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
        setPhase("success");
      } finally {
        setIsSubmitting(false);
      }
    });
  });

  if (!isClientReady || phase === "hidden") {
    return null;
  }

  const fullNameErrorId = `${formId}-full-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const consentErrorId = `${formId}-consent-error`;
  const formErrorId = `${formId}-form-error`;

  return createPortal(
    <>
      <div className="newsletter-popup-backdrop" aria-hidden="true" />
      <div
        ref={panelRef}
        className="newsletter-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
      >
        <button
          type="button"
          className="newsletter-popup__close"
          aria-label="סגירה"
          onClick={dismiss}
        >
          <X aria-hidden="true" className="size-4" />
        </button>

        {phase === "success" ? (
          <div className="newsletter-popup__success" role="status" aria-live="polite">
            <Heart
              aria-hidden="true"
              fill="currentColor"
              className="newsletter-popup__success-icon"
            />
            <p className="newsletter-popup__success-title">נרשמת בהצלחה!</p>
            <p className="newsletter-popup__success-text">
              תודה שהצטרפת — התוכן הראשון בדרך אלייך.
            </p>
          </div>
        ) : (
          <form
            className="newsletter-popup__form"
            onSubmit={onSubmit}
            noValidate
            aria-describedby={formError ? formErrorId : undefined}
          >
            <p id={`${formId}-title`} className="newsletter-popup__title">
              משהו טוב מחכה לך{" "}
              <Heart
                aria-hidden="true"
                fill="currentColor"
                className="newsletter-popup__title-icon"
              />
            </p>
            <p className="newsletter-popup__text">
              תוכן קצר, מחשבות וכלים למערכת יחסים בריאה ונינוחה יותר עם אוכל.
            </p>

            {formError ? (
              <p id={formErrorId} role="alert" className="newsletter-popup__error">
                {formError}
              </p>
            ) : null}

            <label className="sr-only" htmlFor={`${formId}-full-name`}>
              שם מלא
            </label>
            <input
              id={`${formId}-full-name`}
              type="text"
              autoComplete="name"
              placeholder="השם שלך"
              maxLength={NEWSLETTER_FULL_NAME_MAX}
              className="newsletter-popup__field"
              aria-invalid={Boolean(errors.full_name) || undefined}
              aria-describedby={errors.full_name ? fullNameErrorId : undefined}
              {...fullNameRegister}
              ref={(element) => {
                fullNameRegister.ref(element);
                fullNameRef.current = element;
              }}
            />
            {errors.full_name ? (
              <p id={fullNameErrorId} role="alert" className="newsletter-popup__field-error">
                {errors.full_name.message}
              </p>
            ) : null}

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
              className="newsletter-popup__field"
              style={{ textAlign: "right" }}
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? emailErrorId : undefined}
              {...emailRegister}
              ref={(element) => {
                emailRegister.ref(element);
                emailRef.current = element;
              }}
            />
            {errors.email ? (
              <p id={emailErrorId} role="alert" className="newsletter-popup__field-error">
                {errors.email.message}
              </p>
            ) : null}

            <Controller
              name="marketing_consent"
              control={control}
              render={({ field }) => (
                <label htmlFor={`${formId}-consent`} className="newsletter-popup__consent">
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
                    <Link href="/privacy-policy" className="newsletter-popup__link">
                      מדיניות הפרטיות
                    </Link>
                    .
                  </span>
                </label>
              )}
            />
            {errors.marketing_consent ? (
              <p id={consentErrorId} role="alert" className="newsletter-popup__field-error">
                {errors.marketing_consent.message}
              </p>
            ) : null}

            {/* Honeypot — hidden from assistive tech and sighted users */}
            <div className="newsletter-popup__honeypot" aria-hidden="true">
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
              className="newsletter-popup__submit"
              loading={isPending || isSubmitting}
              disabled={isPending || isSubmitting}
            >
              {isPending || isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  נרשמים...
                </>
              ) : (
                "אני רוצה לקבל"
              )}
            </Button>
          </form>
        )}
      </div>
    </>,
    getPortalRoot()
  );
}
