import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  const [animationFinished, setAnimationFinished] = useState(false);
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Minimum splash time (1 second)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Navigation logic
  useEffect(() => {
    const checkAndNavigate = async () => {
      if (animationFinished && minimumTimeElapsed) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {
          try {
            const parkedLocation = await AsyncStorage.getItem("PARKED_LOCATION");

            if (parkedLocation) {
              router.replace("/"); // Go to Home
            } else {
              router.replace("/"); // Still Home (you can customize later)
            }
          } catch (error) {
            router.replace("/");
          }
        });
      }
    };

    checkAndNavigate();
  }, [animationFinished, minimumTimeElapsed]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      <LottieView
        source={require("../assets/images/loadingnew.json")}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={() => setAnimationFinished(true)}
        style={styles.lottie}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  lottie: {
    width: width,
    height: height,
    position: "absolute",
  },
});
