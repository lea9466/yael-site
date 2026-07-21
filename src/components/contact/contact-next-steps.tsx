import { ClipboardList, MessageSquareHeart, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "משאירים פרטים",
    text: "כותבים בקצרה במה תרצו עזרה, בלי לחץ ובלי התחייבות.",
  },
  {
    icon: MessageSquareHeart,
    title: "יעל עוברת על הפנייה",
    text: "כל פנייה נקראת בעיון, כדי להבין מה מתאים להמשך.",
  },
  {
    icon: Sparkles,
    title: "ממשיכים לשיחה מתאימה",
    text: "אם זה מתאים לשני הצדדים — ממשיכים יחד לשיחה אישית.",
  },
] as const;

export function ContactNextSteps() {
  return (
    <section
      className="contact-page__steps"
      aria-labelledby="contact-steps-title"
    >
      <div className="contact-page__steps-inner">
        <div className="contact-page__steps-header">
          <h2 id="contact-steps-title" className="contact-page__steps-title">
            מה קורה מכאן?
          </h2>
          <p className="contact-page__steps-intro">
            תהליך פשוט ושקט — בלי הבטחות מיותרות, עם ליווי אנושי.
          </p>
        </div>

        <ol className="contact-page__steps-list">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li key={step.title} className="contact-page__step">
                <span className="contact-page__step-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="contact-page__step-icon" aria-hidden="true">
                  <Icon className="size-5" />
                </span>
                <h3 className="contact-page__step-title">{step.title}</h3>
                <p className="contact-page__step-text">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
