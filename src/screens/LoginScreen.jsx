import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const LoginScreen = props => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const sendCred = async props => {
    fetch(`${URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(res => res.json())
      .then(async data => {
        if (data.error) {
          let errorMsg = 'Invalid email or password. Please try again.';
          if (data.error.toLowerCase().includes('password')) {
            errorMsg = 'Wrong password. Please try again.';
          } else if (data.error.toLowerCase().includes('email')) {
            errorMsg = 'Email not registered. Please sign up first.';
          } else if (data.error.toLowerCase().includes('not found')) {
            errorMsg = 'Account not found. Please sign up first.';
          }
          Alert.alert('Login Error', errorMsg);
        } else {
          try {
            await AsyncStorage.setItem('token', data.token);
            props.navigation.replace('HomeScreens');
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      });
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
            {/* Logo Section with Explore App link */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo-pet-3.png')}
                style={styles.logo}
              />
              <TouchableOpacity
                onPress={() => navigation.replace('HomeScreens')}
                style={styles.exploreAppLink}>
                <Text style={styles.exploreAppText}>Explore App</Text>
              </TouchableOpacity>
            </View>

            {/* Login Section */}
            <View style={styles.shadowWrapper}>
              <View style={styles.cardContainer}>
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={5}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.cardContent}>
                  <View style={styles.inputContainer}>
                    {/* Email Input */}
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={'#666'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                    />

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
                  </View>
                  <TouchableOpacity
                    onPress={() => sendCred(props)}
                    style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>

                  <Text style={styles.signupText}>
                    Don't have an account?{' '}
                    <Text
                      style={styles.signupLink}
                      onPress={() => navigation.navigate('SignUpScreen')}>
                      Sign Up
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ResetPasswordScreen')}
                    style={styles.forgotPasswordLink}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
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
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shadowWrapper: {
    marginHorizontal: 20,
    marginBottom: 50,
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
  inputContainer: {
    marginTop: 20,
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
  signupText: {
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  signupLink: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#FB6A43',
    fontWeight: 'bold',
    fontSize: 13,
  },
  exploreAppLink: {
    // Removed marginLeft and marginRight since we're using flexDirection: 'row' and justifyContent: 'space-between'
  },
  exploreAppText: {
    color: '#FB6A43',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
