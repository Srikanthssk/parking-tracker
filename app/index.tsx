import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";

const { width, height } = Dimensions.get("window");
const WAVE_BAR_WIDTH = Math.floor((width - 44 - 36) / 7);

export default function HomeScreen() {
  const router = useRouter();
  const [hasParked, setHasParked] = useState(false);

  // Entrance
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const headerY   = useRef(new Animated.Value(-40)).current;
  const card1Y    = useRef(new Animated.Value(60)).current;
  const card2Y    = useRef(new Animated.Value(60)).current;
  const card1Op   = useRef(new Animated.Value(0)).current;
  const card2Op   = useRef(new Animated.Value(0)).current;

  // Blue blob morph
  const blobScale = useRef(new Animated.Value(1)).current;
  const blobX     = useRef(new Animated.Value(0)).current;
  const blobY     = useRef(new Animated.Value(0)).current;

  // Wave bars
  const wave1 = useRef(new Animated.Value(0.4)).current;
  const wave2 = useRef(new Animated.Value(0.7)).current;
  const wave3 = useRef(new Animated.Value(0.5)).current;
  const wave4 = useRef(new Animated.Value(0.9)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;
  const wave6 = useRef(new Animated.Value(0.6)).current;
  const wave7 = useRef(new Animated.Value(0.8)).current;

  // Ring pulse
  const ringScale1 = useRef(new Animated.Value(1)).current;
  const ringOp1    = useRef(new Animated.Value(1)).current;
  const ringScale2 = useRef(new Animated.Value(1)).current;
  const ringOp2    = useRef(new Animated.Value(1)).current;

  // Card press scale
  const s1 = useRef(new Animated.Value(1)).current;
  const s2 = useRef(new Animated.Value(1)).current;

  // Floating dots
  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkParkedLocation();
    entrance();
    blobAnim();
    waveAnim();
    ringPulse();
    floatDots();
  }, []);

  useEffect(() => {
    const interval = setInterval(checkParkedLocation, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkParkedLocation = async () => {
    const stored = await AsyncStorage.getItem("PARKED_LOCATION");
    setHasParked(!!stored);
  };

  const clearParking = async () => {
    await AsyncStorage.removeItem("PARKED_LOCATION");
    setHasParked(false);
    Alert.alert("Cleared", "Session removed.");
  };

  const entrance = () => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 700, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(card1Op, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(card1Y,  { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(card2Op, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(card2Y,  { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
        ]),
      ]).start();
    });
  };

  const blobAnim = () => {
    const loop = (a: Animated.Value, to: number, dur: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: to,  duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(a, { toValue: -to, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();

    loop(blobX, 20, 4000);
    loop(blobY, 16, 3200);
    Animated.loop(Animated.sequence([
      Animated.timing(blobScale, { toValue: 1.12, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(blobScale, { toValue: 0.92, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  };

  const waveAnim = () => {
    const w = (a: Animated.Value, lo: number, hi: number, dur: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: hi, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(a, { toValue: lo, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])).start();

    w(wave1, 0.2, 0.8,  900);
    w(wave2, 0.3, 1.0,  700);
    w(wave3, 0.15, 0.75, 1100);
    w(wave4, 0.4, 0.95, 800);
    w(wave5, 0.1, 0.6,  1000);
    w(wave6, 0.35, 0.9, 850);
    w(wave7, 0.25, 0.85, 950);
  };

  const ringPulse = () => {
    const pulse = (sc: Animated.Value, op: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc, { toValue: 2.4, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(sc, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(1200),
      ])).start();

    pulse(ringScale1, ringOp1, 0);
    pulse(ringScale2, ringOp2, 700);
  };

  const floatDots = () => {
    const f = (a: Animated.Value, range: number, dur: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: -range, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(a, { toValue:  range, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();

    f(dot1Y, 10, 2400);
    f(dot2Y, 14, 3100);
    f(dot3Y, 8,  2800);
  };

  const pi  = (s: Animated.Value) => Animated.spring(s, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const po  = (s: Animated.Value) => Animated.spring(s, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }).start();

  const waves = [wave1, wave2, wave3, wave4, wave5, wave6, wave7];
  const waveHeights = waves.map(w =>
    w.interpolate({ inputRange: [0, 1], outputRange: [6, 36] })
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Animated blue blob */}
      <Animated.View style={[styles.blob, {
        transform: [{ translateX: blobX }, { translateY: blobY }, { scale: blobScale }],
      }]} />
      <View style={styles.blobSmall} />

      {/* Floating dots */}
      <Animated.View style={[styles.floatDot, styles.fd1, { transform: [{ translateY: dot1Y }] }]} />
      <Animated.View style={[styles.floatDot, styles.fd2, { transform: [{ translateY: dot2Y }] }]} />
      <Animated.View style={[styles.floatDot, styles.fd3, { transform: [{ translateY: dot3Y }] }]} />

      {/* Diagonal stripes */}
      <View style={styles.stripe1} />
      <View style={styles.stripe2} />

      <View style={styles.container}>

        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: headerY }] }]}>
          <View style={styles.topRow}>
            <View style={styles.brandBox}>
              <View style={styles.brandDot} />
              <Text style={styles.brandName}>SAZS</Text>
              <Text style={styles.brandSlash}>/</Text>
              <Text style={styles.brandSub}>PARKING</Text>
            </View>

            {/* Double pulse badge */}
            <View style={styles.pulseBadge}>
              <Animated.View style={[styles.pulseRingOuter, { transform: [{ scale: ringScale1 }], opacity: ringOp1 }]} />
              <Animated.View style={[styles.pulseRingOuter, { transform: [{ scale: ringScale2 }], opacity: ringOp2 }]} />
              <View style={[styles.pulseCore, { backgroundColor: hasParked ? "#3B82F6" : "#1E293B" }]} />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleWrap}>
            <Text style={styles.titleLine1}>SMART</Text>
            <View style={styles.titleLine2Wrap}>
              <View style={styles.titleBlueBox}>
                <Text style={styles.titleBlueText}>PARK</Text>
              </View>
              <Text style={styles.titleLine2Gray}> ING</Text>
            </View>
          </View>

          {/* Status strip */}
          <View style={[styles.statusStrip, hasParked && styles.statusStripActive]}>
            <View style={[styles.statusStripDot, { backgroundColor: hasParked ? "#3B82F6" : "#334155" }]} />
            <Text style={[styles.statusStripText, hasParked && styles.statusStripTextActive]}>
              {hasParked ? "SESSION ACTIVE" : "NO SESSION"}
            </Text>
            <View style={styles.statusStripLine} />
          </View>
        </Animated.View>

        {/* CARDS */}
        <View style={styles.cardsWrap}>

          {/* Card 01 — Park */}
          <Animated.View style={{ opacity: card1Op, transform: [{ translateY: card1Y }, { scale: s1 }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => pi(s1)}
              onPressOut={() => po(s1)}
              onPress={() => router.push("/park-details")}
            >
              <View style={styles.blueCard}>
                <View style={styles.blueCardTop}>
                  <Text style={styles.blueCardNum}>01</Text>
                  <View style={styles.blueCardDot} />
                </View>
                <View style={styles.blueCardBody}>
                  <View>
                    <Text style={styles.blueCardTitle}>Park Here</Text>
                    <Text style={styles.blueCardSub}>Save GPS coordinates</Text>
                  </View>
                  <View style={styles.whiteArrowBox}>
                    <Text style={styles.whiteArrow}>↗</Text>
                  </View>
                </View>
                <View style={styles.blueCardBottom}>
                  <Text style={styles.blueCardEmoji}>📍</Text>
                  <Text style={styles.blueCardBottomText}>TAP TO PIN</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Card 02 — Find (same style as 01) */}
          <Animated.View style={{ opacity: card2Op, transform: [{ translateY: card2Y }, { scale: s2 }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => hasParked && pi(s2)}
              onPressOut={() => hasParked && po(s2)}
              onPress={() => router.push("/map")}
              disabled={!hasParked}
            >
              <View style={[styles.blueCard, !hasParked && styles.blueCardDimmed]}>
                <View style={styles.blueCardTop}>
                  <Text style={styles.blueCardNum}>02</Text>
                  <View style={[styles.blueCardDot, !hasParked && styles.blueCardDotOff]} />
                </View>
                <View style={styles.blueCardBody}>
                  <View>
                    <Text style={styles.blueCardTitle}>Find My Car</Text>
                    <Text style={styles.blueCardSub}>
                      {hasParked ? "Navigate to spot" : "Park first to unlock"}
                    </Text>
                  </View>
                  <View style={styles.whiteArrowBox}>
                    <Text style={styles.whiteArrow}>{hasParked ? "↗" : "🔒"}</Text>
                  </View>
                </View>
                <View style={styles.blueCardBottom}>
                  <Text style={styles.blueCardEmoji}>{hasParked ? "🧭" : "🔒"}</Text>
                  <Text style={styles.blueCardBottomText}>
                    {hasParked ? "TAP TO NAVIGATE" : "LOCKED"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

        </View>

        {/* BOTTOM */}
        <Animated.View style={[styles.bottom, { opacity: fadeIn }]}>
          {/* Animated wave bars */}
          <View style={styles.waveRow}>
            {waveHeights.map((h, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    width: WAVE_BAR_WIDTH,
                    backgroundColor: i % 2 === 0 ? "#3B82F6" : "#1E40AF",
                  },
                ]}
              />
            ))}
          </View>

          {hasParked ? (
            <TouchableOpacity style={styles.clearBtn} onPress={clearParking} activeOpacity={0.8}>
              <Text style={styles.clearBtnText}>END SESSION</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.idleHint}>Park your vehicle to begin</Text>
          )}
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F1E" },

  blob: {
    position: "absolute",
    top: -120, right: -120,
    width: 360, height: 360,
    borderRadius: 180,
    backgroundColor: "#1D4ED8",
    opacity: 0.18,
  },
  blobSmall: {
    position: "absolute",
    bottom: 60, left: -80,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: "#1E40AF",
    opacity: 0.12,
  },

  floatDot: { position: "absolute", borderRadius: 999, backgroundColor: "#3B82F6" },
  fd1: { width: 6,  height: 6,  top: "25%", left: "8%",  opacity: 0.5 },
  fd2: { width: 10, height: 10, top: "55%", right: "6%", opacity: 0.3 },
  fd3: { width: 4,  height: 4,  top: "70%", left: "20%", opacity: 0.4 },

  stripe1: {
    position: "absolute",
    top: height * 0.38,
    left: -width * 0.3,
    width: width * 1.6,
    height: 1,
    backgroundColor: "rgba(59,130,246,0.08)",
    transform: [{ rotate: "-6deg" }],
  },
  stripe2: {
    position: "absolute",
    top: height * 0.42,
    left: -width * 0.3,
    width: width * 1.6,
    height: 1,
    backgroundColor: "rgba(59,130,246,0.05)",
    transform: [{ rotate: "-6deg" }],
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 36,
    justifyContent: "space-between",
  },

  // Header
  header: { gap: 14 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B82F6" },
  brandName: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  brandSlash: { color: "#3B82F6", fontSize: 13, fontWeight: "300" },
  brandSub: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "600", letterSpacing: 2 },

  pulseBadge: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  pulseRingOuter: {
    position: "absolute",
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#3B82F6",
  },
  pulseCore: { width: 10, height: 10, borderRadius: 5 },

  titleWrap: { gap: 2, marginTop: 4 },
  titleLine1: { color: "rgba(255,255,255,0.15)", fontSize: 52, fontWeight: "900", letterSpacing: -1, lineHeight: 52 },
  titleLine2Wrap: { flexDirection: "row", alignItems: "center" },
  titleBlueBox: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12, paddingVertical: 2,
    borderRadius: 6, marginRight: 2,
  },
  titleBlueText: { color: "#fff", fontSize: 52, fontWeight: "900", letterSpacing: -1, lineHeight: 58 },
  titleLine2Gray: { color: "rgba(255,255,255,0.6)", fontSize: 52, fontWeight: "900", letterSpacing: -1, lineHeight: 58 },

  statusStrip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  statusStripActive: {
    backgroundColor: "rgba(37,99,235,0.12)",
    borderColor: "rgba(59,130,246,0.3)",
  },
  statusStripDot: { width: 7, height: 7, borderRadius: 4 },
  statusStripText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", letterSpacing: 2, flex: 1 },
  statusStripTextActive: { color: "#93C5FD" },
  statusStripLine: { width: 20, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },

  // Cards
  cardsWrap: { gap: 12 },

  blueCard: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  blueCardDimmed: {
    backgroundColor: "#1E3A6E",
    shadowOpacity: 0.15,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  blueCardTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4,
  },
  blueCardNum: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  blueCardDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.35)" },
  blueCardDotOff: { backgroundColor: "rgba(255,255,255,0.12)" },
  blueCardBody: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 10,
  },
  blueCardTitle: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  blueCardSub: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 2 },
  whiteArrowBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  whiteArrow: { color: "#fff", fontSize: 18, fontWeight: "700" },
  blueCardBottom: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  blueCardEmoji: { fontSize: 16 },
  blueCardBottomText: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "700", letterSpacing: 2 },

  // Bottom
  bottom: { gap: 16, alignItems: "center" },
  waveRow: { flexDirection: "row", alignItems: "flex-end", gap: 5, height: 40 },
  waveBar: { borderRadius: 3 },

  clearBtn: {
    paddingHorizontal: 28, paddingVertical: 13,
    borderRadius: 30,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
  },
  clearBtnText: { color: "#F87171", fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  idleHint: { color: "rgba(255,255,255,0.18)", fontSize: 12, letterSpacing: 0.5 },
});