import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { AppHeader, StackScreenLayout } from "@/components/layout";
import { getLegalDocument, type LegalDocKind } from "@/content/legal";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "LegalDocument">;

function SectionBlock({ title, paragraphs, bullets }: { title: string; paragraphs?: string[]; bullets?: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[textPresets.body, { fontFamily: textPresets.title.fontFamily, textAlign: "right" }]}>{title}</Text>
      {paragraphs?.map((p) => (
        <Text key={p.slice(0, 24)} style={[textPresets.bodySm, { textAlign: "right", lineHeight: 22, color: colors.foreground }]}>
          {p}
        </Text>
      ))}
      {bullets?.map((b) => (
        <View key={b.slice(0, 24)} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <Text style={[textPresets.bodySm, { color: colors.primary, lineHeight: 22 }]}>•</Text>
          <Text style={[textPresets.bodySm, { flex: 1, textAlign: "right", lineHeight: 22, color: colors.foreground }]}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

export function LegalDocumentScreen({ route }: Props) {
  const onBack = useStackBack();
  const kind = (route.params?.kind ?? "privacy") as LegalDocKind;
  const doc = getLegalDocument(kind);

  return (
    <StackScreenLayout
      header={<AppHeader title={doc.title} onBack={onBack} />}
      contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
    >
      {doc.subtitle ? (
        <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>{doc.subtitle}</Text>
      ) : null}

      <View style={{ ...figmaCard, padding: 16, gap: 20 }}>
        {doc.sections.map((section) => (
          <SectionBlock
            key={section.title}
            title={section.title}
            paragraphs={section.paragraphs}
            bullets={section.bullets}
          />
        ))}
      </View>

      <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]}>
        آخر تحديث: 2026 · تطبيق لفة
      </Text>
    </StackScreenLayout>
  );
}
