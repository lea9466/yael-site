"use client";

import { useEffect, useRef, useState } from "react";

import { escapeHtml } from "@/lib/services/sanitize";
import type { ServiceProcessStep } from "@/lib/services/types";
import { cn } from "@/lib/utils/cn";

type ServiceProcessTimelineProps = {
  steps: ServiceProcessStep[];
};

type ProcessStepItemProps = {
  step: ServiceProcessStep;
  index: number;
};

function ProcessStepItem({ step, index }: ProcessStepItemProps) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);
  const stepNumber = index + 1;
  const isOdd = index % 2 === 0;

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <li
      ref={ref}
      className={cn(
        "service-process__step",
        isOdd ? "service-process__step--odd" : "service-process__step--even",
        visible && "service-process__step--visible"
      )}
    >
      <div className="service-process__marker" aria-hidden="true">
        <span className="service-process__marker-number">{stepNumber}</span>
      </div>

      <div className="service-process__card">
        <h3 className="service-process__card-title">
          <span className="sr-only">שלב {stepNumber}: </span>
          {escapeHtml(step.title)}
        </h3>
        <p className="service-process__card-description">
          {escapeHtml(step.description)}
        </p>
      </div>
    </li>
  );
}

export function ServiceProcessTimeline({ steps }: ServiceProcessTimelineProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section
      className="service-process"
      aria-labelledby="service-process-heading"
    >
      <h2 id="service-process-heading" className="service-process__title">
        איך התהליך עובד
      </h2>

      <ol className="service-process__timeline">
        {steps.map((step, index) => (
          <ProcessStepItem
            key={`${step.title}-${index}`}
            step={step}
            index={index}
          />
        ))}
      </ol>
    </section>
  );
}
