import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Bell, Car, MapPin, Menu, Navigation, Package, Search, Truck } from "lucide-react-native";
import type { AppStackParamList, MainTabParamList } from "@/navigation/types";
import { useAppState } from "@/state/AppStateContext";
import { redirectToAuth, requiresAuth } from "@/lib/authGate";
import { HomeNavMenu, type HomeMenuAction } from "@/components/HomeNavMenu";
import { measureHomeMenuAnchor, MENU_PANEL_WIDTH } from "@/components/homeMenuAnchor";
import { ServiceWaitIndicator } from "@/components/ServiceWaitIndicator";
import { AppMapView, MapMarker, hasNativeMapModule } from "@/components/maps/AppMapView";
import { BottomSheet, PrimaryButton } from "@/components/layout";
import { colors, gradientColors, gradients } from "@/theme/tokens";
import { fonts, rtlText, textPresets } from "@/theme/textStyles";

const fillAbsolute = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

const CURRENT_LOCATION = { latitude: 24.7495, longitude: 46.6753 };
const MAP_CENTER = { latitude: CURRENT_LOCATION.latitude - 0.007, longitude: CURRENT_LOCATION.longitude };

type ServiceKey = "regular" | "premium" | "family" | "bike" | "cargo" | "tow";

const services: { Icon: typeof Car; label: string; key: ServiceKey; price: string }[] = [
  { Icon: Car, label: "صغيرة", key: "regular", price: "25 ر.س" },
  { Icon: Car, label: "فارهة", key: "premium", price: "45 ر.س" },
  { Icon: Car, label: "عائلية", key: "family", price: "55 ر.س" },
  { Icon: Navigation, label: "دراجة", key: "bike", price: "18 ر.س" },
  { Icon: Package, label: "بضائع", key: "cargo", price: "70 ر.س" },
  { Icon: Truck, label: "سطحة", key: "tow", price: "95 ر.س" },
];

type HomeNav = CompositeNavigationProp<
  BottomTabScreenProps<MainTabParamList, "Home">["navigation"],
  NativeStackNavigationProp<AppStackParamList>
>;

interface CustomerHomeScreenProps {
  hideBottomNav?: boolean;
}

export default function CustomerHomeScreen({ hideBottomNav: _hideBottomNav = true }: CustomerHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNav>();
  const { notifications, bookingDraft, prepareBooking, isLoggedIn, setPendingAuth } = useAppState();
  const [selectedService, setSelectedService] = useState<ServiceKey>(bookingDraft.serviceType ?? "regular");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const menuButtonRef = useRef<View>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const menuPanelWidth = MENU_PANEL_WIDTH;

  const unreadCount = notifications.filter((item) => !item.read).length;
  const selectedMeta = services.find((s) => s.key === selectedService) ?? services[0];

  const selectService = (key: ServiceKey) => {
    setSelectedService(key);
    prepareBooking(key);
  };

  useFocusEffect(
    useCallback(() => {
      if (bookingDraft.serviceType) {
        setSelectedService(bookingDraft.serviceType);
      }
    }, [bookingDraft.serviceType]),
  );

  const openPlanRide = () => {
    if (requiresAuth() && !isLoggedIn) {
      redirectToAuth(navigation, setPendingAuth, "rider", "login", isLoggedIn);
      return;
    }
    prepareBooking(selectedService);
    navigation.navigate("PlanRide", { service: selectedService, focusField: "destination" });
  };

  const menuNavigate = (action: HomeMenuAction) => {
    setMenuOpen(false);
    setMenuAnchor(null);
    switch (action) {
      case "notifications":
        navigation.navigate("Notifications");
        break;
      case "wallet":
        navigation.navigate("Wallet");
        break;
      case "orders":
        navigation.navigate("Orders");
        break;
      case "promo":
        navigation.navigate("Referral");
        break;
      case "settings":
        navigation.navigate("Settings");
        break;
      default:
        break;
    }
  };

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      setMenuOpen(false);
      setMenuAnchor(null);
      return;
    }
    const node = menuButtonRef.current;
    if (!node) return;
    measureHomeMenuAnchor(
      (cb) => node.measureInWindow(cb),
      menuPanelWidth,
      (anchor) => {
        setMenuAnchor(anchor);
        setMenuOpen(true);
      },
    );
  }, [menuOpen]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const topOffset = insets.top + 48;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {hasNativeMapModule && MapMarker ? (
        <AppMapView
          style={fillAbsolute}
          initialRegion={{
            latitude: MAP_CENTER.latitude,
            longitude: MAP_CENTER.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          <MapMarker coordinate={CURRENT_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.primary,
                  borderWidth: 3,
                  borderColor: colors.card,
                }}
              />
            </View>
          </MapMarker>
        </AppMapView>
      ) : (
        <View style={[fillAbsolute, { backgroundColor: colors.secondary }]}>
          <View
            style={{
              position: "absolute",
              top: "32%",
              right: "34%",
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={14} color={colors.primaryForeground} />
          </View>
          <View
            style={{
              position: "absolute",
              top: "42%",
              left: "22%",
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={gradientColors(gradients.mapFade)}
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={fillAbsolute}
      />

      {/* Top bar: menu pinned physical left, bell physical right — pill centered with gutters so dropdown is not covered */}
      <View style={{ position: "absolute", top: topOffset, left: 16, right: 16, zIndex: 20 }}>
        <View style={{ minHeight: 48, justifyContent: "center" }}>
          <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, justifyContent: "center" }}>
            <View ref={menuButtonRef} collapsable={false}>
              <Pressable
                accessibilityLabel="فتح القائمة"
                onPress={toggleMenu}
                hitSlop={8}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Menu size={18} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityLabel="الإشعارات"
            onPress={() => navigation.navigate("Notifications")}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              width: 44,
              height: 44,
              alignSelf: "center",
              borderRadius: 22,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
            }}
          >
            <Bell size={20} color={colors.foreground} />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  right: 6,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  paddingHorizontal: 4,
                  backgroundColor: colors.destructive,
                  borderWidth: 2,
                  borderColor: colors.card,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 10, color: colors.destructiveForeground }}>
                  {Math.min(unreadCount, 9)}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View
            style={{
              marginLeft: 56,
              marginRight: 56,
              backgroundColor: colors.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 9,
              zIndex: 0,
              elevation: 0,
            }}
          >
            <Text style={{ ...textPresets.caption, textAlign: "center" }} numberOfLines={1}>
              الموقع الحالي
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 13,
                color: colors.foreground,
                textAlign: "center",
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              حي النخيل
            </Text>
          </View>
        </View>
      </View>

      <BottomSheet>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={openPlanRide}
            accessibilityRole="button"
            accessibilityLabel="خطّط رحلتك"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: colors.secondary,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: colors.card,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: colors.foreground, textAlign: "right" }}>
                إلى أين تريد الذهاب؟
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 12,
                  color: colors.mutedForeground,
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                خطّط رحلتك · الآن أو لاحقاً
              </Text>
            </View>
          </Pressable>

          <Text style={{ ...textPresets.labelMuted, marginTop: 16, marginBottom: 8 }}>فئة الرحلة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {services.map(({ Icon, label, key, price }) => {
              const sel = selectedService === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => selectService(key)}
                  style={{
                    minWidth: 104,
                    borderRadius: 17,
                    borderWidth: 1,
                    borderColor: sel ? colors.primary : colors.border,
                    backgroundColor: sel ? colors.primary : colors.secondary,
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Icon size={16} color={sel ? colors.primaryForeground : colors.foreground} />
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 12,
                        color: sel ? colors.primaryForeground : colors.foreground,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 11,
                      marginTop: 5,
                      color: sel ? "rgba(255,255,255,0.8)" : colors.mutedForeground,
                      textAlign: "right",
                    }}
                  >
                    {price}
                  </Text>
                  <ServiceWaitIndicator service={key} selected={sel} />
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label={`متابعة مع فئة ${selectedMeta.label}`}
              onPress={openPlanRide}
            />
          </View>
        </View>
      </BottomSheet>

      {/* Render last so menu sits above BottomSheet/map chrome on Android */}
      <HomeNavMenu
        open={menuOpen && !!menuAnchor}
        anchor={menuAnchor}
        panelWidth={menuPanelWidth}
        onClose={() => {
          setMenuOpen(false);
          setMenuAnchor(null);
        }}
        onSelect={menuNavigate}
      />
    </View>
  );
}
