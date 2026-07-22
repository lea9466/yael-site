export type LegalDocumentSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  /** Optional paragraphs rendered after the items list. */
  afterItems?: string[];
};

export type LegalDocumentContent = {
  pageTitle: string;
  badge: string;
  /** Replace before publish, e.g. "22 ביולי 2026". */
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
  sections: LegalDocumentSection[];
  contactHeading: string;
  contactIntro: string;
  /** Placeholders — fill with real business details before publish. */
  contactDetails: {
    businessName: string;
    email: string;
    phone: string;
  };
};
