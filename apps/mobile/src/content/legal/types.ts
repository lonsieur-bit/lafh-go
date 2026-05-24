export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
};
