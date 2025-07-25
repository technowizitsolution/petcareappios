import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApp} from '@react-native-firebase/app';

// API URL
const URL = 'https://petcare-1c443.el.r.appspot.com';

const PhoneSignIn = props => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('PhoneSignIn useEffect running'); // Debug log to confirm effect runs
    try {
      const app = getApp();
      console.log('================ FIREBASE CONFIGURATION ================');
      console.log('App Name:', app.name);
      console.log('Project ID:', app.options.projectId);
      console.log('Package Name:', app.options.packageName);
      console.log('App ID:', app.options.appId);
      console.log('API Key:', app.options.apiKey);
      console.log('Database URL:', app.options.databaseURL);
      console.log('Storage Bucket:', app.options.storageBucket);
      console.log('Messaging Sender ID:', app.options.messagingSenderId);
      console.log('All options:', JSON.stringify(app.options, null, 2));
      console.log('========================================================');
    } catch (error) {
      console.error('Firebase config error:', error);
    }
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('Auth state changed: user detected', user);
        checkUserExists(user);
      } else {
        console.log('Auth state changed: no user');
      }
    });
    return unsubscribe;
  }, []);

  const handlePhoneNumberChange = input => {
    console.log('Phone input changed:', input);
    let cleanNumber = input.replace(/^[+]?91/, '').replace(/\s+/g, '');
    setPhoneNumber(cleanNumber ? `+91${cleanNumber}` : '');
  };

  const checkUserExists = async user => {
    try {
      setLoading(true);
      const firebaseToken = await user.getIdToken();
      console.log('Firebase token:', firebaseToken);
      await AsyncStorage.setItem('firebaseToken', firebaseToken);

      const response = await fetch(`${URL}/check-user-exists`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: user.phoneNumber}),
      });
      const data = await response.json();
      console.log('Check user exists response:', data);

      if (response.ok && data.exists) {
        const authResponse = await fetch(`${URL}/phone-signin`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({phone: user.phoneNumber}),
        });
        const authData = await authResponse.json();
        console.log('Phone sign-in response:', authData);
        if (authResponse.ok) {
          await AsyncStorage.setItem('token', authData.token);
          navigation.replace('HomeScreens');
        } else {
          throw new Error(authData.error || 'Failed to authenticate');
        }
      } else {
        console.log('User does not exist, navigating to SignUpScreen');
        navigation.navigate('SignUpScreen', {
          phone: user.phoneNumber,
          firebaseUser: user.uid,
        });
      }
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during phone verification. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  async function sendVerificationCode() {
    try {
      setLoading(true);
      setMessage('');

      if (!phoneNumber) {
        Alert.alert(
          'Error',
          'Please enter a valid phone number to receive the OTP.',
        );
        return;
      }

      console.log('Sending OTP to:', phoneNumber);

      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setVerificationId(confirmation.verificationId);
      setMessage('OTP sent to your phone.');
      console.log('OTP sent, verificationId:', confirmation.verificationId);
    } catch (error) {
      console.error('OTP Error:', error);
      Alert.alert(
        'Error',
        'Unable to send OTP. Please check your phone number and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode() {
    try {
      if (!verificationId) {
        Alert.alert('Error', 'Verification ID is missing. Request OTP again.');
        return;
      }

      setLoading(true);
      setMessage('');
      console.log('Verifying OTP with ID:', verificationId, 'and code:', code);

      const credential = auth.PhoneAuthProvider.credential(
        verificationId,
        code,
      );
      await auth().signInWithCredential(credential);

      setMessage('Phone verification successful!');
      console.log('Phone verification successful!');
    } catch (error) {
      console.error('OTP Verification Error:', error);

      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert(
          'Error',
          'The OTP you entered is incorrect. Please try again.',
        );
      } else if (error.code === 'auth/code-expired') {
        Alert.alert('Error', 'The OTP has expired. Please request a new OTP.');
        setVerificationId(null);
        setCode('');
      } else {
        Alert.alert(
          'Error',
          'An unexpected error occurred during phone verification. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (!verificationId) {
    return (
      <ImageBackground
        source={require('../assets/images/LogInPageBG.png')}
        style={styles.background}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo-pet-3.png')}
            style={styles.logo}
          />
        </View>
        <View style={styles.cardContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={5}
          />
          <View style={styles.cardContent}>
            <View style={styles.inputContainer}>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor={'#666'}
                  value={phoneNumber.replace('+91', '')}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={sendVerificationCode}
              style={[
                styles.loginButton,
                {opacity: loading || !phoneNumber ? 0.7 : 1},
              ]}
              disabled={loading || !phoneNumber}>
              <Text style={styles.loginButtonText}>
                {loading ? 'Sending...' : 'Login / Sign Up'}
              </Text>
            </TouchableOpacity>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/LogInPageBG.png')}
      style={styles.background}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-pet-3.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.cardContainer}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
        />
        <View style={styles.cardContent}>
          <Text style={styles.verificationTitle}>Enter Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={'#666'}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            onPress={confirmCode}
            style={[
              styles.loginButton,
              {opacity: loading || code.length < 6 ? 0.7 : 1},
            ]}
            disabled={loading || code.length < 6}>
            <Text style={styles.loginButtonText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              setVerificationId(null);
              setCode('');
              setMessage('');
            }}>
            <Text style={styles.googleButtonText}>Try a different number</Text>
          </TouchableOpacity>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  logoContainer: {
    marginTop: 10,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 200,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  cardContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    marginTop: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  countryCode: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingRight: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#FB6A43',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 0,
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
  message: {
    marginTop: 10,
    color: '#FB6A43',
    textAlign: 'center',
    fontWeight: '500',
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
});

export default PhoneSignIn;
