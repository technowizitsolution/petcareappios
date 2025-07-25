import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BlurView} from '@react-native-community/blur';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const requestOtp = async () => {
    if (!email) {
      Alert.alert('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${URL}/forgot-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email.');
        setStep(2);
      } else {
        let errorMsg = data.error || 'Failed to send OTP.';
        if (errorMsg.toLowerCase().includes('not registered')) {
          errorMsg = 'Email not registered. Please sign up first.';
        } else if (errorMsg.toLowerCase().includes('invalid')) {
          errorMsg = 'Invalid email address.';
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${URL}/forgot-password/verify`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, otp}),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'OTP verified. Please set your new password.');
        setStep(3);
      } else {
        Alert.alert('Error', data.error || 'Failed to verify OTP.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const resetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Please enter a new password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${URL}/forgot-password/reset`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, newPassword}),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password reset successful. Please log in.', [
          {text: 'OK', onPress: () => navigation.replace('LoginScreen')},
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('../assets/images/LogInPageBG.png')}
          style={styles.background}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo-pet-3.png')}
                style={styles.logo}
              />
            </View>

            <View style={styles.shadowWrapper}>
              <View style={styles.cardContainer}>
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={5}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.title}>Reset Password</Text>
                  {step === 1 && (
                    <>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#666"
                      />
                      <TouchableOpacity
                        style={styles.button}
                        onPress={requestOtp}
                        disabled={loading}>
                        <Text style={styles.buttonText}>
                          {loading ? 'Sending...' : 'Send OTP'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Text style={styles.label}>OTP</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#666"
                      />
                      <TouchableOpacity
                        style={styles.button}
                        onPress={verifyOtp}
                        disabled={loading}>
                        <Text style={styles.buttonText}>
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Text style={styles.label}>New Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#666"
                      />
                      <TouchableOpacity
                        style={styles.button}
                        onPress={resetPassword}
                        disabled={loading}>
                        <Text style={styles.buttonText}>
                          {loading ? 'Resetting...' : 'Reset Password'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backLink}>
                    <Text style={styles.backText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  logoContainer: {
    marginTop: 10,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  logo: {
    resizeMode: 'contain',
  },
  shadowWrapper: {
    marginHorizontal: 20,
    marginBottom: 150,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FB6A43',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  backText: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ResetPasswordScreen;
