import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { BlurView } from '@react-native-community/blur'
import {useNavigation} from '@react-navigation/native';

const LoginCard = () => {
    const navigation = useNavigation();
  return (
    <View>
      <View style={styles.cardContainer}>
        <BlurView
          style={StyleSheet.absoluteFill} // Ensure BlurView covers the card
          blurType="light"
          blurAmount={8}
          reducedTransparencyFallbackColor="white"
        />
        {/* Add your card content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Take Care Of</Text>
          <Text style={styles.cardTitle}>Your Pet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreens')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleButton}>
            <Image
              source={require('../assets/images/google-logo.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Log In With Google</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default LoginCard

const styles = StyleSheet.create({   
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 75,
    borderRadius: 20,
    overflow: 'hidden', // Ensures BlurView respects the border radius
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  cardContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 0, // Prevent shadow effects
    color: '#000',
    backgroundColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#FB6A43',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderColor: '#CCC',
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 15,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signupText: {
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  signupLink: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
})