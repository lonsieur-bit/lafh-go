import type { LegalDocument } from "./types";
import { privacyPolicyAr } from "./privacyPolicy";
import { termsAndConditionsAr } from "./termsAndConditions";
import { usageTermsAr } from "./usageTerms";

export type LegalDocKind = "privacy" | "terms" | "usage";

export const legalDocuments: Record<LegalDocKind, LegalDocument> = {
  privacy: privacyPolicyAr,
  terms: termsAndConditionsAr,
  usage: usageTermsAr,
};

export function getLegalDocument(kind: LegalDocKind): LegalDocument {
  return legalDocuments[kind];
}

export type { LegalDocument, LegalSection } from "./types";
