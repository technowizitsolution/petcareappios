import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import auth from '@react-native-firebase/auth';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const sendDeleteOtp = async () => {
    setSendingOtp(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${URL}/delete-account/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email address');
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const deleteAccount = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n• Your profile and all personal data\n• All your pets and their information\n• All your appointments\n• All stored images',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDeletion,
        },
      ],
    );
  };

  const performDeletion = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${URL}/delete-account/verify-and-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({otp}),
      });

      const data = await response.json();

      if (response.ok) {
        // Account deleted successfully
        Alert.alert(
          'Account Deleted',
          `Your account has been successfully deleted.\n\nDeleted data:\n• ${
            data.deletedData?.appointments || 0
          } appointments\n• ${data.deletedData?.pets || 0} pets`,
          [
            {
              text: 'OK',
              onPress: logout,
            },
          ],
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Remove AsyncStorage tokens
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('firebaseToken');

      // Sign out from Firebase
      //const currentUser = auth().currentUser;
      //if (currentUser) {
      //  await auth().signOut();
      //}

      // Reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    } catch (error) {
      console.log('Error during logout:', error);
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={50} color="#FF4444" />
          <Text style={styles.warningTitle}>Account Deletion Warning</Text>
          <Text style={styles.warningText}>
            Deleting your account is permanent and cannot be undone. This action
            will:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>
              • Delete your profile and all personal data
            </Text>
            <Text style={styles.warningItem}>
              • Remove all your pets and their information
            </Text>
            <Text style={styles.warningItem}>
              • Cancel all your appointments
            </Text>
            <Text style={styles.warningItem}>• Delete all stored images</Text>
          </View>
        </View>

        {!otpSent ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Step 1: Request Verification
            </Text>
            <Text style={styles.sectionText}>
              We'll send a verification code to your email address to confirm
              this deletion request.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.otpButton]}
              onPress={sendDeleteOtp}
              disabled={sendingOtp}>
              {sendingOtp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Step 2: Enter Verification Code
            </Text>
            <Text style={styles.sectionText}>
              Enter the 6-digit code sent to your email address:
            </Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={deleteAccount}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Delete My Account</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resendButton]}
              onPress={sendDeleteOtp}
              disabled={sendingOtp}>
              {sendingOtp ? (
                <ActivityIndicator color="#FB6A43" />
              ) : (
                <Text style={[styles.buttonText, styles.resendButtonText]}>
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4444',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  warningList: {
    alignSelf: 'stretch',
  },
  warningItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF',
    letterSpacing: 2,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  otpButton: {
    backgroundColor: '#FB6A43',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FB6A43',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  resendButtonText: {
    color: '#FB6A43',
  },
});

export default DeleteAccountScreen;
