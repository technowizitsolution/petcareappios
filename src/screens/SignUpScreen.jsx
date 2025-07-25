import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

const URL = 'https://petcare-1c443.el.r.appspot.com';

// Image validation utility
const validateImage = asset => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes

  if (!allowedTypes.includes(asset.type)) {
    Alert.alert(
      'Invalid File Type',
      'Please select a PNG, JPG, or JPEG image.',
    );
    return false;
  }

  if (asset.fileSize > maxSize) {
    Alert.alert('File Too Large', 'Please select an image smaller than 2MB.');
    return false;
  }

  return true;
};

const SignUpScreen = props => {
  const route = useRoute();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [firebaseUid, setFirebaseUid] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [phoneOTPVerified, setPhoneOTPVerified] = useState(false);
  const [showEmailOTPInput, setShowEmailOTPInput] = useState(false);
  const [showPhoneOTPInput, setShowPhoneOTPInput] = useState(false);
  const [emailOTPLoading, setEmailOTPLoading] = useState(false);
  const [phoneOTPLoading, setPhoneOTPLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if we have phone number from params (phone auth flow)
    if (route.params?.phone) {
      setPhone(route.params.phone);
    }

    // Store the firebase UID if available
    if (route.params?.firebaseUser) {
      setFirebaseUid(route.params.firebaseUser);
    }
  }, [route.params]);

  // Reset OTP state if email/phone changes
  useEffect(() => {
    setEmailOTP('');
    setEmailOTPVerified(false);
    setShowEmailOTPInput(false);
  }, [email]);
  useEffect(() => {
    setPhoneOTP('');
    setPhoneOTPVerified(false);
    setShowPhoneOTPInput(false);
  }, [phone]);

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];

        if (validateImage(asset)) {
          const source = {uri: asset.uri};
          setImage(source);
        }
      }
    });
  };

  const sendCred = async () => {
    // Validate fields
    if (!name) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }
    if (!email) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Information', 'Please enter a password.');
      return;
    }
    if (!phone) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return;
    }
    if (!address) {
      Alert.alert('Missing Information', 'Please enter your address.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('address', address);

    // Add OTPs for backend verification
    formData.append('emailOtp', emailOTP);
    formData.append('phoneOtp', phoneOTP);

    // If we have firebase UID, include it in signup
    if (firebaseUid) {
      formData.append('firebaseUid', firebaseUid);
    }

    if (image) {
      formData.append('userImage', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'userImage.jpg',
      });
    }

    try {
      const response = await fetch(`${URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
          const firebaseToken = await AsyncStorage.getItem('firebaseToken');
          if (firebaseToken) {
            console.log('Firebase token available:', firebaseToken);
          }
          Alert.alert('Success', 'Sign up successful', [
            {
              text: 'OK',
              onPress: () => navigation.replace('HomeScreens'),
            },
          ]);
        } else {
          Alert.alert('Success', 'Sign up successful', [
            {
              text: 'OK',
              onPress: () => navigation.replace('LoginScreen'),
            },
          ]);
        }
      } else {
        let errorMsg = 'Unable to sign up. Please try again later.';
        if (data.error) {
          const err = data.error.toLowerCase();
          if (err.includes('email') && err.includes('exists')) {
            errorMsg = 'Email already registered. Please log in.';
          } else if (err.includes('phone') && err.includes('exists')) {
            errorMsg = 'Phone number already registered.';
          } else if (err.includes('invalid') && err.includes('email')) {
            errorMsg = 'Invalid email format.';
          } else if (err.includes('password')) {
            errorMsg = 'Password too weak. Please choose a stronger password.';
          } else if (err.includes('otp')) {
            errorMsg = 'OTP incorrect or expired. Please try again.';
          }
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while signing up. Please try again.',
      );
    }
  };

  // --- OTP Handlers ---
  const requestEmailOTP = async () => {
    if (!email) {
      Alert.alert('Please enter your email first.');
      return;
    }
    setEmailOTPLoading(true);
    try {
      const response = await fetch(`${URL}/send-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const data = await response.json();
      if (response.ok) {
        setShowEmailOTPInput(true);
        Alert.alert('Success', 'OTP sent to your email.');
      } else {
        Alert.alert('Error', data.error || 'Could not send OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not send OTP.');
    } finally {
      setEmailOTPLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (!email) {
      Alert.alert('Please enter your email first.');
      return;
    }
    try {
      const response = await fetch(`${URL}/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, otp: emailOTP}),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailOTPVerified(true);
        setShowEmailOTPInput(false);
        Alert.alert('Success', 'Email verified!');
      } else {
        Alert.alert('Error', data.error || 'Could not verify OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not verify OTP.');
    }
  };

  const requestPhoneOTP = async () => {
    if (!phone) {
      Alert.alert('Please enter your phone number first.');
      return;
    }
    setPhoneOTPLoading(true);
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${phone}`;
    }
    try {
      const response = await fetch(`${URL}/send-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: formattedPhone}),
      });
      const data = await response.json();
      if (response.ok) {
        setShowPhoneOTPInput(true);
        Alert.alert('Success', 'OTP sent to your phone.');
      } else {
        Alert.alert('Error', data.error || 'Could not send OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not send OTP.');
    } finally {
      setPhoneOTPLoading(false);
    }
  };

  const verifyPhoneOTP = async () => {
    if (!phone) {
      Alert.alert('Please enter your phone number first.');
      return;
    }
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${phone}`;
    }
    try {
      const response = await fetch(`${URL}/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: formattedPhone, otp: phoneOTP}),
      });
      const data = await response.json();
      if (response.ok) {
        setPhoneOTPVerified(true);
        setShowPhoneOTPInput(false);
        Alert.alert('Success', 'Phone verified!');
      } else {
        Alert.alert('Error', data.error || 'Could not verify OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not verify OTP.');
    }
  };

  // const canSignUp = emailOTPVerified && phoneOTPVerified;
  const canSignUp = emailOTPVerified;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Image
              source={require('../assets/images/logopet1.png')}
              style={styles.Logo}
            />
            <Text style={styles.title}>Sign Up</Text>

            {/* Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={'#666'}
              value={name}
              onChangeText={setName}
            />

            {/* Email Input with Send OTP Button */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Email Address"
                placeholderTextColor={'#666'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={text => setEmail(text.toLowerCase())}
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={requestEmailOTP}
                disabled={emailOTPLoading}>
                <Text style={styles.verifyButtonText}>
                  {emailOTPLoading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            {showEmailOTPInput && !emailOTPVerified && (
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="Enter Email OTP"
                  placeholderTextColor={'#666'}
                  value={emailOTP}
                  onChangeText={setEmailOTP}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={verifyEmailOTP}>
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              </View>
            )}

            {emailOTPVerified && (
              <Text style={styles.verifiedText}>Email verified!</Text>
            )}

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={'#666'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />

            {/* Phone Input (no OTP) */}
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor={'#666'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!route.params?.phone}
            />

            {/* Address Input */}
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={'#666'}
              value={address}
              onChangeText={setAddress}
            />

            {/* Image Picker */}
            <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
              <Text style={styles.buttonText}>Select Profile Image</Text>
            </TouchableOpacity>

            {image && <Image source={image} style={styles.image} />}

            {/* Sign-Up Button */}
            <TouchableOpacity
              style={[styles.button, canSignUp ? null : styles.buttonDisabled]}
              onPress={sendCred}
              disabled={!canSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.redirectContainer}>
              <Text style={styles.redirectText}>
                Already have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('LoginScreen')}>
                  Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  Logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#e9e9e9',
    color: '#888',
  },
  imageButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#FB6A43',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FB6A43',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  redirectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  redirectText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    color: '#FB6A43',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputFlex: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  verifyButton: {
    width: 100,
    height: 50,
    backgroundColor: '#FB6A43',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedText: {
    color: 'green',
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SignUpScreen;
