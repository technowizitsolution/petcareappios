import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const UpdateUserProfileScreen = ({route}) => {
  const {data} = route.params;
  const navigation = useNavigation();

  const [name, setName] = useState(data.name);
  const [email, setEmail] = useState(data.email);
  const [phone, setPhone] = useState(data.phone);
  const [address, setAddress] = useState(data.address);
  const [userImage, setUserImage] = useState(data.userImage);

  // OTP states
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [phoneOTPVerified, setPhoneOTPVerified] = useState(false);
  const [showEmailOTPInput, setShowEmailOTPInput] = useState(false);
  const [showPhoneOTPInput, setShowPhoneOTPInput] = useState(false);
  const [emailOTPLoading, setEmailOTPLoading] = useState(false);
  const [phoneOTPLoading, setPhoneOTPLoading] = useState(false);
  const originalEmail = useRef(data.email);
  const originalPhone = useRef(data.phone);

  // Password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
          setUserImage(source);
        }
      }
    });
  };

  // --- OTP Handlers ---
  const requestEmailOTP = async () => {
    if (!email) {
      Alert.alert('Please enter your email first.');
      return;
    }
    setEmailOTPLoading(true);
    try {
      const res = await fetch(`${URL}/send-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const result = await res.json();
      if (res.ok) {
        setShowEmailOTPInput(true);
        Alert.alert('Success', 'OTP sent to your email.');
      } else {
        Alert.alert('Error', result.error || 'Could not send OTP.');
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
      const res = await fetch(`${URL}/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, otp: emailOTP}),
      });
      const result = await res.json();
      if (res.ok) {
        setEmailOTPVerified(true);
        setShowEmailOTPInput(false);
        Alert.alert('Success', 'Email verified!');
      } else {
        Alert.alert('Error', result.error || 'Could not verify OTP.');
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
      const res = await fetch(`${URL}/send-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: formattedPhone}),
      });
      const result = await res.json();
      if (res.ok) {
        setShowPhoneOTPInput(true);
        Alert.alert('Success', 'OTP sent to your phone.');
      } else {
        Alert.alert('Error', result.error || 'Could not send OTP.');
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
      const res = await fetch(`${URL}/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone: formattedPhone, otp: phoneOTP}),
      });
      const result = await res.json();
      if (res.ok) {
        setPhoneOTPVerified(true);
        setShowPhoneOTPInput(false);
        Alert.alert('Success', 'Phone verified!');
      } else {
        Alert.alert('Error', result.error || 'Could not verify OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not verify OTP.');
    }
  };

  // Reset OTP state if email/phone changes
  React.useEffect(() => {
    setEmailOTP('');
    setEmailOTPVerified(false);
    setShowEmailOTPInput(false);
  }, [email]);
  React.useEffect(() => {
    setPhoneOTP('');
    setPhoneOTPVerified(false);
    setShowPhoneOTPInput(false);
  }, [phone]);

  // Only require OTP if email/phone changed
  const emailChanged = email !== originalEmail.current;
  const phoneChanged = phone !== originalPhone.current;
  const canUpdate = !emailChanged || emailOTPVerified;

  const updateUser = async () => {
    if (!canUpdate) {
      Alert.alert('Please verify OTP for changed email before updating.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      if (userImage && userImage.uri) {
        formData.append('userImage', {
          uri: userImage.uri,
          type: 'image/jpeg',
          name: 'userImage.jpg',
        });
      }
      // Optionally send OTPs for backend validation
      if (emailChanged) {
        formData.append('emailOtp', emailOTP);
      }
      if (phoneChanged) {
        formData.append('phoneOtp', phoneOTP);
      }

      const response = await fetch(`${URL}/user/${data._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        await response.json();
        Alert.alert('Success', 'User updated successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        const errorText = await response.text();
        let errorMsg = 'Failed to update User.';
        if (errorText.toLowerCase().includes('email')) {
          errorMsg = 'Invalid or duplicate email.';
        } else if (errorText.toLowerCase().includes('phone')) {
          errorMsg = 'Invalid or duplicate phone number.';
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update User');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({oldPassword, newPassword}),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to change password');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.Name}>Update User Details</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Image</Text>
          <View style={styles.imageEditWrapper}>
            <TouchableOpacity
              onPress={selectImage}
              activeOpacity={0.7}
              style={styles.imageTouchable}>
              {userImage ? (
                <Image
                  source={{uri: userImage.uri || userImage}}
                  style={styles.image}
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Icon name="account" size={48} color="#ccc" />
                </View>
              )}
              <View style={styles.pencilIconWrapper}>
                <Icon name="pencil-circle" size={32} color="#FB6A43" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Email</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Email Address"
              placeholderTextColor="#aaa"
            />
            {email !== originalEmail.current && (
              <TouchableOpacity
                style={[styles.imageButton, styles.otpButton]}
                onPress={requestEmailOTP}
                disabled={emailOTPLoading}>
                <Text style={styles.buttonText}>
                  {emailOTPLoading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {showEmailOTPInput &&
            email !== originalEmail.current &&
            !emailOTPVerified && (
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Enter Email OTP"
                  value={emailOTP}
                  onChangeText={setEmailOTP}
                  keyboardType="number-pad"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  style={[styles.imageButton, styles.otpButton]}
                  onPress={verifyEmailOTP}>
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
              </View>
            )}
          {emailOTPVerified && email !== originalEmail.current && (
            <Text style={styles.verifiedText}>Email verified!</Text>
          )}

          <Text style={styles.label}>Phone</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor="#aaa"
            />
            {/*
            {phone !== originalPhone.current && (
              <TouchableOpacity
                style={[styles.imageButton, styles.otpButton]}
                onPress={requestPhoneOTP}
                disabled={phoneOTPLoading}>
                <Text style={styles.buttonText}>
                  {phoneOTPLoading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            )}
            */}
          </View>
          {/*
          {showPhoneOTPInput &&
            phone !== originalPhone.current &&
            !phoneOTPVerified && (
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Enter Phone OTP"
                  value={phoneOTP}
                  onChangeText={setPhoneOTP}
                  keyboardType="number-pad"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  style={[styles.imageButton, styles.otpButton]}
                  onPress={verifyPhoneOTP}>
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
              </View>
            )}
          {phoneOTPVerified && phone !== originalPhone.current && (
            <Text style={styles.verifiedText}>Phone verified!</Text>
          )}
          */}

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={updateUser}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.changePasswordButton]}
          onPress={() => setShowPasswordModal(true)}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Old Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <View style={styles.passwordRow}>
                <TouchableOpacity
                  style={[styles.button, styles.passwordButton]}
                  onPress={handleChangePassword}
                  disabled={passwordLoading}>
                  <Text style={styles.buttonText}>
                    {passwordLoading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.passwordButtonCancel]}
                  onPress={() => setShowPasswordModal(false)}>
                  <Text
                    style={[
                      styles.buttonText,
                      styles.passwordButtonTextCancel,
                    ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFDFD',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  infoContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 50,
    paddingBottom: 20,
    marginTop: -30,
  },
  Name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    color: '#aaa',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  imageButton: {
    backgroundColor: '#FB6A43',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  otpButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 90,
  },
  button: {
    backgroundColor: '#FB6A43',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 0,
    borderRadius: 50,
    backgroundColor: '#f2f2f2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginBottom: 10,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flex1: {
    flex: 1,
  },
  verifiedText: {
    color: 'green',
    marginBottom: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  imagePreviewWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  imageEditWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
  },
  imageTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  pencilIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    elevation: 3,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passwordButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FB6A43',
  },
  passwordButtonCancel: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#ccc',
  },
  passwordButtonTextCancel: {
    color: '#333',
  },
  changePasswordButton: {
    marginBottom: 10,
  },
});

export default UpdateUserProfileScreen;
