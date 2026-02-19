import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  ScrollView,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

export default function MapScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem("PARKED_LOCATION");
    if (!stored) {
      Alert.alert("No parked location found");
      return;
    }
    const parsed = JSON.parse(stored);
    setData(parsed);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const current = await Location.getCurrentPositionAsync({});
      setCurrentLocation(current.coords);
    }
  };

  const openNavigation = () => {
    if (!data?.coords) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${data.coords.latitude},${data.coords.longitude}`;
    Linking.openURL(url);
  };

  const formatTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data) {
    return (
      <View style={styles.emptyRoot}>
        <Text style={styles.emptyText}>NO ACTIVE{"\n"}SESSION</Text>
        <TouchableOpacity style={styles.backBtnEmpty} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Map - top half */}
      <View style={styles.mapContainer}>
        {data.coords && (
          <MapView
            style={styles.map}
            showsUserLocation
            initialRegion={{
              latitude: data.coords.latitude,
              longitude: data.coords.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
          >
            <Marker
              coordinate={data.coords}
              title={`Slot ${data.slot}`}
              description={data.carNumber}
            />
          </MapView>
        )}

        {/* Overlay back button */}
        <TouchableOpacity style={styles.mapBack} onPress={() => router.back()}>
          <Text style={styles.mapBackText}>←</Text>
        </TouchableOpacity>

        {/* Slot badge on map */}
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>SLOT {data.slot}</Text>
        </View>
      </View>

      {/* Details panel - bottom half */}
      <Animated.View style={[styles.panel, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Pull handle */}
          <View style={styles.handle} />

          {/* Car Number - hero */}
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>VEHICLE</Text>
              <Text style={styles.heroNumber}>{data.carNumber || "—"}</Text>
            </View>
            <View style={styles.activeChip}>
              <View style={styles.activeDot} />
              <Text style={styles.activeChipText}>ACTIVE</Text>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>SLOT</Text>
              <Text style={styles.infoValue}>{data.slot || "—"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellBorder]}>
              <Text style={styles.infoLabel}>PARKED AT</Text>
              <Text style={styles.infoValue}>{formatTime(data.timestamp)}</Text>
            </View>
          </View>

          {/* Person Info */}
          <View style={styles.personCard}>
            <View style={styles.personLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {data.personName ? data.personName[0].toUpperCase() : "?"}
                </Text>
              </View>
            </View>
            <View style={styles.personRight}>
              <Text style={styles.personLabel}>PARKING ATTENDANT</Text>
              <Text style={styles.personName}>{data.personName || "—"}</Text>
              {data.personId ? (
                <Text style={styles.personId}>ID: {data.personId}</Text>
              ) : null}
            </View>
          </View>

          {/* Photos */}
          {data.photos && data.photos.length > 0 && (
            <View style={styles.photosSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>PHOTOS</Text>
              </View>
              <View style={styles.photoRow}>
                {data.photos.map((uri: string, i: number) => (
                  <Image key={i} source={{ uri }} style={styles.photo} />
                ))}
              </View>
            </View>
          )}

          {/* Coords */}
          <View style={styles.coordsRow}>
            <Text style={styles.coordText}>
              {data.coords?.latitude?.toFixed(6)}° N
            </Text>
            <Text style={styles.coordDivider}>·</Text>
            <Text style={styles.coordText}>
              {data.coords?.longitude?.toFixed(6)}° E
            </Text>
          </View>

          {/* Navigate Button */}
          <TouchableOpacity style={styles.navBtn} onPress={openNavigation} activeOpacity={0.85}>
            <Text style={styles.navBtnText}>🧭  NAVIGATE TO CAR</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  // Empty state
  emptyRoot: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  emptyText: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  backBtnEmpty: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backBtnText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // Map
  mapContainer: {
    height: "42%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapBack: {
    position: "absolute",
    top: 52,
    left: 20,
    width: 42,
    height: 42,
    backgroundColor: "rgba(10,10,10,0.85)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBackText: {
    color: "#fff",
    fontSize: 18,
  },
  slotBadge: {
    position: "absolute",
    top: 52,
    right: 20,
    backgroundColor: "#FFD000",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  slotBadgeText: {
    color: "#0A0A0A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // Bottom panel
  panel: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },

  // Hero
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 4,
  },
  heroNumber: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 2,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,255,135,0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00FF87",
  },
  activeChipText: {
    color: "#00FF87",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  infoCell: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  infoCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },
  infoValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Person Card
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 24,
  },
  personLeft: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0A0A0A",
    fontSize: 22,
    fontWeight: "900",
  },
  personRight: {
    flex: 1,
  },
  personLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  personName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  personId: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  // Photos
  photosSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionLine: {
    width: 16,
    height: 2,
    backgroundColor: "#FFD000",
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
  },
  photoRow: {
    flexDirection: "row",
    gap: 10,
  },
  photo: {
    flex: 1,
    height: 100,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Coords
  coordsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  coordText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  coordDivider: {
    color: "rgba(255,255,255,0.1)",
    fontSize: 16,
  },

  // Navigate Button
  navBtn: {
    backgroundColor: "#FFD000",
    borderRadius: 4,
    paddingVertical: 20,
    alignItems: "center",
  },
  navBtnText: {
    color: "#0A0A0A",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});