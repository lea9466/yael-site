import { Scale } from "lucide-react";

import type {
  LegalDocumentContent,
  LegalDocumentSection,
} from "@/content/legal-document";

type LegalDocumentViewProps = {
  content: LegalDocumentContent;
  /** Unique id for the page H1 — keep stable for skip/aria anchors. */
  titleId: string;
};

function formatSectionIndex(index: number): string {
  return String(index).padStart(2, "0");
}

function LegalDocumentSectionBlock({
  section,
  index,
}: {
  section: LegalDocumentSection;
  index: number;
}) {
  return (
    <section
      id={section.id}
      className="legal-document-page__section"
      aria-labelledby={`${section.id}-title`}
    >
      <div className="legal-document-page__section-heading">
        <span className="legal-document-page__section-index" aria-hidden="true">
          {formatSectionIndex(index)}
        </span>
        <h2 id={`${section.id}-title`} className="legal-document-page__h2">
          {section.title}
        </h2>
      </div>

      <div className="legal-document-page__section-body">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="legal-document-page__paragraph">
            {paragraph}
          </p>
        ))}

        {section.items && section.items.length > 0 ? (
          <ul className="legal-document-page__list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {section.afterItems?.map((paragraph) => (
          <p key={paragraph} className="legal-document-page__paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export function LegalDocumentView({ content, titleId }: LegalDocumentViewProps) {
  const { contactDetails } = content;
  const email = contactDetails.email.trim();
  const phone = contactDetails.phone.trim();
  const contactTitleId = `${titleId}-contact`;
  const contactIndex = content.sections.length + 1;

  return (
    <div className="legal-document-page">
      <header className="legal-document-page__hero" aria-labelledby={titleId}>
        <div className="legal-document-page__hero-inner">
          <p className="legal-document-page__badge">
            <Scale
              aria-hidden="true"
              className="legal-document-page__badge-icon"
            />
            {content.badge}
          </p>
          <h1 id={titleId} className="legal-document-page__title">
            {content.pageTitle}
          </h1>
          <div className="legal-document-page__hero-rule" aria-hidden="true" />
          <p className="legal-document-page__updated">
            <span className="legal-document-page__updated-label">
              {content.lastUpdatedLabel}
            </span>
            <span className="legal-document-page__updated-value">
              {content.lastUpdatedValue}
            </span>
          </p>
        </div>
      </header>

      <article className="legal-document-page__article">
        <div className="legal-document-page__reading">
          {content.sections.map((section, index) => (
            <LegalDocumentSectionBlock
              key={section.id}
              section={section}
              index={index + 1}
            />
          ))}

          <section
            id={`${titleId}-contact-section`}
            className="legal-document-page__section legal-document-page__contact"
            aria-labelledby={contactTitleId}
          >
            <div className="legal-document-page__section-heading">
              <span
                className="legal-document-page__section-index"
                aria-hidden="true"
              >
                {formatSectionIndex(contactIndex)}
              </span>
              <h2 id={contactTitleId} className="legal-document-page__h2">
                {content.contactHeading}
              </h2>
            </div>

            <div className="legal-document-page__section-body">
              <p className="legal-document-page__paragraph">
                {content.contactIntro}
              </p>
              <dl className="legal-document-page__contact-list">
                <div className="legal-document-page__contact-item">
                  <dt>שם העסק</dt>
                  <dd>{contactDetails.businessName}</dd>
                </div>
                {email ? (
                  <div className="legal-document-page__contact-item">
                    <dt>אימייל</dt>
                    <dd>
                      <a
                        href={`mailto:${email}`}
                        className="legal-document-page__link public-focus-ring"
                      >
                        {email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {phone ? (
                  <div className="legal-document-page__contact-item">
                    <dt>טלפון</dt>
                    <dd>
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                        className="legal-document-page__link public-focus-ring"
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
