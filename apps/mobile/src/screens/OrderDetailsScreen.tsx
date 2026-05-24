import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { TripRouteMap } from "@/components/maps/TripRouteMap";
import { OrderContactCard, OrderDriverContactCard, alertMissingContact } from "@/components/OrderContactCard";
import { OrderDetailsHeader } from "@/components/OrderDetailsHeader";
import { StackScreenLayout } from "@/components/layout";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ltrText, textPresets } from "@/theme/textStyles";
import type { AppStackParamList } from "@/navigation/types";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";
import { stackBack } from "@/navigation/useStackBack";
import { useAppState } from "@/state/AppStateContext";
import { fetchFreightOrder, fetchOrderById, isSupabaseReady, riderFreightConfirm, type FreightOrderSnapshot } from "@luffa/shared";
import { PrimaryButton } from "@/components/layout";
import { freightMock } from "@/services/freightMock";
import type { Order } from "@/shared/types";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";

type Props =
  | NativeStackScreenProps<AppStackParamList, "OrderDetails">
  | NativeStackScreenProps<CaptainStackParamList, "CaptainOrderDetails">;

function RouteChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[textPresets.bodySm, { marginTop: 4 }]}>{value}</Text>
    </View>
  );
}

function handleOrderDetailsBack(navigation: Props["navigation"], appRole: "rider" | "captain", routeName: string) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  if (appRole !== "captain" && routeName === "OrderDetails") {
    stackBack(navigation as NativeStackScreenProps<AppStackParamList, "OrderDetails">["navigation"], "Orders");
  }
}

export function OrderDetailsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { orders, appRole, setOrders, setCaptainActiveOrderId } = useAppState();
  const routeName = route.name;
  const orderId = route.params.orderId;
  const orderFromState = orders.find((item) => item.id === orderId);
  const [order, setOrder] = useState<Order | null>(orderFromState ?? null);
  const [loadingOrder, setLoadingOrder] = useState(!orderFromState);
  const onBack = () => handleOrderDetailsBack(navigation, appRole, routeName);
  const [freightSnap, setFreightSnap] = useState<FreightOrderSnapshot | null>(null);
  const [confirmingFreight, setConfirmingFreight] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingOrder(true);
      if (isSupabaseReady()) {
        const fetched = await fetchOrderById(orderId);
        if (!cancelled) setOrder(fetched ?? orderFromState ?? null);
      } else if (!cancelled) {
        setOrder(orderFromState ?? null);
      }
      if (!cancelled) setLoadingOrder(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, orderFromState]);

  useEffect(() => {
    void (async () => {
      if (isSupabaseReady()) {
        const s = await fetchFreightOrder(orderId);
        setFreightSnap(s);
      } else {
        setFreightSnap(freightMock.get(orderId));
      }
    })();
  }, [orderId]);

  const needsFreightConfirm =
    appRole === "rider" &&
    freightSnap &&
    freightSnap.captainConfirmedMatch &&
    !freightSnap.riderConfirmedMatch;

  const confirmFreight = async () => {
    setConfirmingFreight(true);
    try {
      if (isSupabaseReady()) {
        await riderFreightConfirm(orderId);
      } else {
        freightMock.riderConfirm(orderId);
      }
      const s = isSupabaseReady() ? await fetchFreightOrder(orderId) : freightMock.get(orderId);
      setFreightSnap(s);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "active",
                statusLabel: "نشط — جاري التنفيذ",
                price: `${(s?.captainQuoteSar ?? s?.riderOfferSar ?? 0).toFixed(2)} ر.س`,
                total: `${(s?.captainQuoteSar ?? s?.riderOfferSar ?? 0).toFixed(2)} ر.س`,
              }
            : o,
        ),
      );
    } finally {
      setConfirmingFreight(false);
    }
  };

  const openOrderChat = (peerName: string, peerPhone: string | null) => {
    const chatParams = { orderId, peerName, peerPhone };
    if (appRole === "captain") {
      (navigation as NativeStackScreenProps<CaptainStackParamList, "CaptainOrderDetails">["navigation"]).navigate(
        "CaptainChat",
        chatParams,
      );
      return;
    }
    (navigation as NativeStackScreenProps<AppStackParamList, "OrderDetails">["navigation"]).navigate("Chat", chatParams);
  };

  if (loadingOrder) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={[textPresets.bodySm, { color: colors.mutedForeground, textAlign: "center", marginBottom: 24 }]}>
          الطلب غير موجود
        </Text>
        <Pressable
          style={{
            borderRadius: 16,
            backgroundColor: colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 14,
            width: "100%",
            maxWidth: 280,
            alignItems: "center",
          }}
          onPress={onBack}
        >
          <Text style={[textPresets.bodySm, { color: colors.primaryForeground, fontFamily: textPresets.title.fontFamily }]}>
            العودة
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <StackScreenLayout
      header={<OrderDetailsHeader order={order} onBack={onBack} />}
      contentContainerStyle={{ gap: 16, paddingBottom: 28 }}
    >
      {needsFreightConfirm && freightSnap ? (
        <View
          style={{
            ...figmaCard,
            padding: 16,
            gap: 12,
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}0A`,
          }}
        >
          <Text style={[textPresets.title, { textAlign: "right", fontSize: 17 }]}>عرض الكابتن بانتظار موافقتك</Text>
          <Text style={[textPresets.body, { textAlign: "right" }]}>
            السعر: {(freightSnap.captainQuoteSar ?? 0).toFixed(2)} ر.س
            {freightSnap.captainQuoteSar !== freightSnap.riderOfferSar
              ? ` (اقتراحك كان ${freightSnap.riderOfferSar.toFixed(2)} ر.س)`
              : " — قبل سعرك"}
          </Text>
          <PrimaryButton
            label={confirmingFreight ? "جارٍ التأكيد..." : "موافقة وبدء الخدمة"}
            disabled={confirmingFreight}
            onPress={() => void confirmFreight()}
          />
        </View>
      ) : null}

      <View style={{ ...figmaCard, padding: 12, gap: 10 }}>
        <TripRouteMap
          pickup={{ label: order.from, lat: order.pickupLat, lng: order.pickupLng }}
          destination={{ label: order.to, lat: order.dropoffLat, lng: order.dropoffLng }}
        />
        <RouteChip label="من" value={order.from} />
        <RouteChip label="إلى" value={order.to} />
      </View>

      <CancelOrderButton
        orderId={order.id}
        status={order.status}
        statusLabel={order.statusLabel}
        onCancelled={handleOrderCancelled}
      />

      <View style={{ ...figmaCard, padding: 18 }}>
        <Text style={[textPresets.title, { fontSize: 16, marginBottom: 16, textAlign: "center" }]}>مسار الطلب</Text>
        {order.timeline.map((step, index) => (
          <View key={step.id} style={{ flexDirection: "row", gap: 12, minHeight: 48 }}>
            <View style={{ alignItems: "center", width: 18 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: step.done ? colors.primary : colors.border,
                  marginTop: 4,
                }}
              />
              {index < order.timeline.length - 1 ? (
                <View style={{ width: 2, flex: 1, backgroundColor: colors.primary, marginTop: 4, opacity: 0.35 }} />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 12 }}>
              <Text style={[textPresets.body, step.done ? {} : { color: colors.mutedForeground }]}>{step.title}</Text>
              {step.time ? <Text style={[textPresets.caption, ltrText, { marginTop: 4 }]}>{step.time}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {appRole === "captain" ? (
        order.rider ? (
          <OrderContactCard
            title="العميل"
            contact={order.rider}
            onChat={() => openOrderChat(order.rider!.name, order.rider!.phone)}
          />
        ) : (
          <OrderDriverContactCard
            title="العميل"
            name="عميل"
            phone={null}
            onChat={() => alertMissingContact("rider")}
          />
        )
      ) : order.captain ? (
        <OrderContactCard
          title="الكابتن"
          contact={order.captain}
          subtitle={`${order.driver.carModel} · ${order.driver.plate}`}
          onChat={() => openOrderChat(order.captain!.name, order.captain!.phone)}
        />
      ) : (
        <OrderDriverContactCard
          title="الكابتن"
          name={order.driver.name}
          subtitle={`${order.driver.carModel} · ${order.driver.plate}`}
          onChat={() => openOrderChat(order.driver.name, null)}
        />
      )}

      <View style={{ ...figmaCard, padding: 18 }}>
        <Text style={[textPresets.title, { fontSize: 16, marginBottom: 14, textAlign: "center" }]}>تفاصيل الفاتورة</Text>
        {order.receipt.map((line) => (
          <View
            key={line.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={[textPresets.bodySm, ltrText]}>{line.amount}</Text>
            <Text style={textPresets.bodySm}>{line.label}</Text>
          </View>
        ))}
        {order.discount ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 }}>
            <Text style={[textPresets.bodySm, ltrText, { color: colors.success }]}>{order.discount}</Text>
            <Text style={[textPresets.bodySm, { color: colors.success }]}>خصم</Text>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 14,
            marginTop: 4,
            borderTopWidth: 2,
            borderTopColor: colors.border,
          }}
        >
          <Text style={[textPresets.title, ltrText, { color: colors.primary }]}>{order.total}</Text>
          <Text style={textPresets.title}>الإجمالي</Text>
        </View>
      </View>
    </StackScreenLayout>
  );
}
