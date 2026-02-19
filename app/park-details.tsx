import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";

const SLOT_ROWS = ["A", "B", "C", "D"];
const SLOT_COLS = [1, 2, 3, 4, 5, 6];

export default function ParkDetailsScreen() {
  const router = useRouter();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [carNumber, setCarNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [personId, setPersonId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Get current location for map preview
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc.coords);
      }
    })();
  }, []);

  const pickPhoto = async () => {
    if (photos.length >= 2) {
      Alert.alert("Limit reached", "You can add up to 2 photos.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow photo access to continue.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 2) {
      Alert.alert("Limit reached", "You can add up to 2 photos.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow camera access to continue.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedSlot) {
      Alert.alert("Missing", "Please select a parking slot.");
      return;
    }
    if (!carNumber.trim()) {
      Alert.alert("Missing", "Please enter the car number.");
      return;
    }
    if (!personName.trim()) {
      Alert.alert("Missing", "Please enter the parking person's name.");
      return;
    }

    setSaving(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location access.");
        setSaving(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const parkingData = {
        coords: location.coords,
        slot: selectedSlot,
        carNumber: carNumber.trim().toUpperCase(),
        personName: personName.trim(),
        personId: personId.trim(),
        photos,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem("PARKED_LOCATION", JSON.stringify(parkingData));
      setSaving(false);
      Alert.alert("Saved 🚗", `Slot ${selectedSlot} secured!`, [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch {
      setSaving(false);
      Alert.alert("Error", "Could not save parking details.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ── MAP PREVIEW (same as map.tsx) ── */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            style={styles.map}
            showsUserLocation
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
          >
            <Marker
              coordinate={currentLocation}
              title="Your current location"
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Locating...</Text>
          </View>
        )}

        {/* Back button overlay */}
        <TouchableOpacity style={styles.mapBack} onPress={() => router.back()}>
          <Text style={styles.mapBackText}>←</Text>
        </TouchableOpacity>

        {/* Live badge */}
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>📍 LIVE</Text>
        </View>
      </View>

      {/* ── DETAILS PANEL (unchanged) ── */}
      <Animated.View style={[styles.panel, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {/* Pull handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.tagline}>SAZS PARKING SYSTEMS</Text>
              <Text style={styles.title}>PARK{"\n"}DETAILS</Text>
            </View>
          </View>

          {/* BG decorations */}
          <View style={styles.bgSquare1} />
          <View style={styles.bgSquare2} />

          {/* Slot Picker */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>SELECT SLOT</Text>
            </View>

            <View style={styles.slotGrid}>
              {SLOT_ROWS.map((row) => (
                <View key={row} style={styles.slotRow}>
                  <Text style={styles.rowLabel}>{row}</Text>
                  {SLOT_COLS.map((col) => {
                    const slotId = `${row}${col}`;
                    const active = selectedSlot === slotId;
                    return (
                      <TouchableOpacity
                        key={slotId}
                        style={[styles.slot, active && styles.slotActive]}
                        onPress={() => setSelectedSlot(slotId)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.slotText, active && styles.slotTextActive]}>
                          {col}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {selectedSlot && (
              <View style={styles.selectedBadge}>
                <View style={styles.selectedDot} />
                <Text style={styles.selectedText}>SLOT {selectedSlot} SELECTED</Text>
              </View>
            )}
          </View>

          {/* Car Number */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>CAR NUMBER</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🚗</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TN 01 AB 1234"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={carNumber}
                onChangeText={setCarNumber}
                autoCapitalize="characters"
                maxLength={15}
              />
            </View>
          </View>

          {/* Person Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>PARKING PERSON</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={personName}
                onChangeText={setPersonName}
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 10 }]}>
              <Text style={styles.inputIcon}>🪪</Text>
              <TextInput
                style={styles.input}
                placeholder="ID / Badge Number (optional)"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={personId}
                onChangeText={setPersonId}
              />
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>PHOTOS ({photos.length}/2)</Text>
            </View>

            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => removePhoto(i)}
                  >
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 2 && (
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} activeOpacity={0.8}>
                    <Text style={styles.photoBtnIcon}>📷</Text>
                    <Text style={styles.photoBtnText}>CAMERA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} activeOpacity={0.8}>
                    <Text style={styles.photoBtnIcon}>🖼️</Text>
                    <Text style={styles.photoBtnText}>GALLERY</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "SAVING..." : "📍  CONFIRM & SAVE LOCATION"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  // ── Map (same style as map.tsx) ──
  mapContainer: {
    height: "38%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
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
  liveBadge: {
    position: "absolute",
    top: 52,
    right: 20,
    backgroundColor: "#FFD000",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  liveBadgeText: {
    color: "#0A0A0A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // ── Panel (slides up from bottom like map.tsx) ──
  panel: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: -20,
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 14,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // BG decorations
  bgSquare1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "20deg" }],
  },
  bgSquare2: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: "rgba(255,208,0,0.07)",
    transform: [{ rotate: "20deg" }],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
  },
  tagline: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 38,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionLine: {
    width: 20,
    height: 2,
    backgroundColor: "#FFD000",
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
  },

  // Slot Grid
  slotGrid: { gap: 8 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "700",
    width: 14,
    letterSpacing: 1,
  },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  slotActive: { backgroundColor: "#FFD000", borderColor: "#FFD000" },
  slotText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  slotTextActive: { color: "#0A0A0A" },
  selectedBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  selectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00FF87" },
  selectedText: { color: "#00FF87", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  // Inputs
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600", letterSpacing: 0.5 },

  // Photos
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  photoThumb: { width: 110, height: 80, borderRadius: 4, overflow: "hidden", position: "relative" },
  photoImage: { width: "100%", height: "100%" },
  removePhoto: {
    position: "absolute", top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  removePhotoText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  photoActions: { flexDirection: "row", gap: 10 },
  photoBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  photoBtnIcon: { fontSize: 22 },
  photoBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: "700", letterSpacing: 2 },

  // Save Button
  saveBtn: {
    backgroundColor: "#FFD000",
    borderRadius: 4,
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#0A0A0A", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },
});