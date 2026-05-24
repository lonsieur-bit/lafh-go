const tokenData = {
  colors: {
    primary: { value: "hsl(262, 83%, 58%)", usage: "اللون الأساسي / Primary brand" },
    secondary: { value: "hsl(215, 20%, 94%)", usage: "الأسطح الثانوية / Secondary surfaces" },
    success: { value: "hsl(152, 69%, 40%)", usage: "حالة النجاح / Success states" },
    warning: { value: "hsl(45, 93%, 47%)", usage: "تحذير / Warning states" },
    destructive: { value: "hsl(0, 72%, 51%)", usage: "خطأ / Error & destructive" },
    info: { value: "hsl(210, 92%, 52%)", usage: "معلومات / Info states" },
  },
  spacing: ["4px", "8px", "12px", "16px", "20px", "24px", "32px", "40px", "48px", "64px"],
  radii: { sm: "8px", md: "10px", lg: "12px", xl: "16px", "2xl": "20px", full: "9999px" },
  typography: {
    "Display": "28px / 700 / -0.02em",
    "Heading 1": "24px / 700 / -0.01em",
    "Heading 2": "20px / 600 / 0",
    "Body": "14px / 400 / 0",
    "Body Bold": "14px / 600 / 0",
    "Caption": "12px / 400 / 0.01em",
    "Small": "10px / 500 / 0.02em",
  },
};

const DesignTokens = () => (
  <div className="space-y-8" dir="rtl">
    {/* Colors */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">ألوان النظام / Color Tokens</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(tokenData.colors).map(([name, { value, usage }]) => (
          <div key={name} className="text-center">
            <div className="w-full aspect-square rounded-2xl shadow-elevated mb-2" style={{ backgroundColor: value }} />
            <p className="text-sm font-semibold text-foreground capitalize">{name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{value}</p>
            <p className="text-[10px] text-muted-foreground font-arabic mt-0.5">{usage}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Typography */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">المقاسات الطباعية / Typography Scale</h3>
      <div className="bg-card rounded-2xl p-6 shadow-elevated space-y-4">
        {Object.entries(tokenData.typography).map(([name, spec]) => {
          const size = parseInt(spec);
          return (
            <div key={name} className="flex items-baseline justify-between border-b border-border pb-3 last:border-0">
              <span className="font-arabic" style={{ fontSize: `${size}px`, fontWeight: spec.includes("700") ? 700 : spec.includes("600") ? 600 : 400 }}>
                نص تجريبي / Sample Text
              </span>
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">{name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{spec}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    {/* Spacing */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">المسافات / Spacing Scale</h3>
      <div className="bg-card rounded-2xl p-6 shadow-elevated">
        <div className="space-y-3">
          {tokenData.spacing.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono w-12">{s}</span>
              <div className="bg-primary/20 rounded" style={{ width: s, height: '16px' }} />
              <span className="text-xs text-muted-foreground">space-{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Border Radius */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">الحواف / Border Radius</h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(tokenData.radii).map(([name, value]) => (
          <div key={name} className="text-center">
            <div className="w-16 h-16 bg-primary/15 border-2 border-primary/30" style={{ borderRadius: value }} />
            <p className="text-xs font-medium text-foreground mt-2">{name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{value}</p>
          </div>
        ))}
      </div>
    </section>

    {/* React Native Example */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">مثال React Native</h3>
      <div className="bg-foreground text-primary-foreground rounded-2xl p-6 overflow-x-auto">
        <pre className="text-xs leading-relaxed font-mono" dir="ltr">{`// theme/tokens.ts
export const tokens = {
  colors: {
    primary: '#7C3AED',
    secondary: '#EDF1F5',
    success: '#21A366',
    warning: '#E0A800',
    destructive: '#DC2626',
    info: '#1D8FE1',
    background: { light: '#FAF9F5', dark: '#101827' },
    foreground: { light: '#1A2332', dark: '#F5F0E8' },
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  radius: {
    sm: 8, md: 10, lg: 12, xl: 16, full: 9999,
  },
  typography: {
    display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
};

// Example Button component
import { StyleSheet, Pressable, Text } from 'react-native';
import { tokens } from './tokens';

export const LuffaButton = ({ title, variant = 'primary' }) => (
  <Pressable style={[styles.btn, styles[variant]]}>
    <Text style={styles.btnText}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.xl,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: tokens.colors.primary,
  },
  btnText: {
    color: '#FFF',
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '600',
  },
});`}</pre>
      </div>
    </section>

    {/* File structure */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">هيكل الملفات / Asset Structure</h3>
      <div className="bg-card rounded-2xl p-6 shadow-elevated">
        <pre className="text-xs text-foreground font-mono leading-relaxed" dir="ltr">{`assets/
├── images/
│   ├── customer/
│   │   ├── home/
│   │   │   ├── hero-banner@1x.png
│   │   │   ├── hero-banner@2x.png
│   │   │   └── hero-banner@3x.png
│   │   ├── booking/
│   │   └── tracking/
│   ├── driver/
│   │   ├── dashboard/
│   │   ├── navigation/
│   │   └── profile/
│   ├── provider/
│   └── admin/
├── icons/
│   ├── svg/
│   │   ├── car.svg
│   │   ├── truck.svg
│   │   └── package.svg
│   └── png/
│       ├── car@2x.png
│       └── car@3x.png
├── lottie/
│   ├── loading.json
│   ├── success.json
│   └── empty-state.json
└── fonts/
    ├── NotoSansArabic-Regular.ttf
    └── Inter-Regular.ttf`}</pre>
      </div>
    </section>
  </div>
);

export default DesignTokens;
