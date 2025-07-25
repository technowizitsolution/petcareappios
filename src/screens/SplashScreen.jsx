import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen'); // Replace 'Home' with your next screen
    }, 3000); // Splash screen duration (3 seconds)
    return () => clearTimeout(timer); // Cleanup timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/SplashScreenLogo.png')} // Add your logo image here
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260, // Adjust size as per your image
    height: 231,
    marginBottom: 20,
  },
});

export default SplashScreen;
