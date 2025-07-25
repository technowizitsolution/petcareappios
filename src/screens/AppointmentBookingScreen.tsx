import React, {useState, useEffect} from 'react';
import {
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation, useRoute} from '@react-navigation/native';
import notifee, {AndroidImportance, TriggerType} from '@notifee/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const URL = 'https://petcare-1c443.el.r.appspot.com';

// Function to display a confirmation notification
const displayBookingConfirmation = async (
  petName,
  appointmentType,
  appointmentDate,
) => {
  // Request notification permissions
  await notifee.requestPermission();

  // Create a notification channel for Android
  const channelId = await notifee.createChannel({
    id: 'booking-confirmations',
    name: 'Booking Confirmations',
    importance: AndroidImportance.HIGH,
  });

  // Display the notification
  await notifee.displayNotification({
    title: 'Appointment Booked Successfully!',
    body: `Your ${appointmentType} appointment for ${petName} on ${appointmentDate} has been scheduled. Our team will contact you shortly for confirmation.`,
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
      smallIcon: 'ic_launcher', // make sure this icon exists in your android project
    },
    ios: {
      categoryId: 'booking',
    },
  });
};

// Function to schedule reminder notifications
const scheduleAppointmentReminder = async (
  petName,
  appointmentType,
  appointmentDate,
  appointmentId,
) => {
  // Request notification permissions
  await notifee.requestPermission();

  // Create a notification channel for Android
  const channelId = await notifee.createChannel({
    id: 'appointment-reminders',
    name: 'Appointment Reminders',
    importance: AndroidImportance.HIGH,
  });

  // Get appointment date as Date object
  const appointmentDateTime = new Date(appointmentDate);

  // 1. Create a reminder for the day before (24 hours)
  const dayBeforeDateTime = new Date(appointmentDateTime);
  dayBeforeDateTime.setDate(dayBeforeDateTime.getDate() - 1); // 1 day before

  // Make sure we're not setting a reminder in the past
  if (dayBeforeDateTime > new Date()) {
    // Schedule the day-before notification
    await notifee.createTriggerNotification(
      {
        id: `reminder-day-before-${appointmentId}`, // Use a unique ID so we can cancel it later if needed
        title: 'Upcoming Appointment Reminder',
        body: `Don't forget! Your pet ${petName} has a ${appointmentType} appointment tomorrow.`,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
        },
        ios: {
          categoryId: 'reminder',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: dayBeforeDateTime.getTime(),
      },
    );
  }

  // 2. Create a reminder for the same day (morning of appointment)
  const sameDayDateTime = new Date(appointmentDateTime);
  // Set to 8:00 AM on the day of appointment
  sameDayDateTime.setHours(8, 0, 0, 0);

  // Make sure the reminder time is not in the past
  if (sameDayDateTime > new Date()) {
    // Format the appointment time nicely
    const timeString = appointmentDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    // Schedule the same-day notification
    await notifee.createTriggerNotification(
      {
        id: `reminder-same-day-${appointmentId}`,
        title: 'Appointment Today',
        body: `Reminder: Your pet ${petName} has a ${appointmentType} appointment today.`,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
        },
        ios: {
          categoryId: 'reminder',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: sameDayDateTime.getTime(),
      },
    );
  }
};

// Function to cancel all appointment reminders
const cancelAppointmentReminders = async appointmentId => {
  // Cancel both the day-before and same-day reminders
  await notifee.cancelNotification(`reminder-day-before-${appointmentId}`);
  await notifee.cancelNotification(`reminder-same-day-${appointmentId}`);
};

// Add Pet type
interface Pet {
  _id: string;
  name: string;
  [key: string]: any;
}

const AppointmentBookingScreen = () => {
  // Type navigation and route for React Navigation
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Get the appointment type from route params, default to 'Treatment' if not provided
  const initialAppointmentType = route.params?.appointmentType || 'Treatment';
  const initialAppointmentDate = route.params?.appointmentDate
    ? new Date(route.params.appointmentDate) // Parse ISO string back to Date
    : new Date();

  const [petId, setPetId] = useState('');
  const [userName, setUserName] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null); // Store the whole pet object for easy access to name
  const [appointmentType, setAppointmentType] = useState(
    initialAppointmentType,
  );
  const [appointmentDate, setAppointmentDate] = useState(
    initialAppointmentDate,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showGroomingTypePicker, setShowGroomingTypePicker] = useState(false);
  const [showHairCutPicker, setShowHairCutPicker] = useState(false);
  const [showBathingPicker, setShowBathingPicker] = useState(false);
  const [showAppointmentTypePicker, setShowAppointmentTypePicker] =
    useState(false);
  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date');

  // Grooming form fields - these are the only specific fields in the model
  const [hairCut, setHairCut] = useState('');
  const [groomingType, setGroomingType] = useState('none');
  const [bathing, setBathing] = useState('');

  // Check for login immediately when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('LoginScreen');
        return;
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    // Ensure this effect only runs once when the component mounts
    if (initialAppointmentDate) {
      setAppointmentDate(initialAppointmentDate);
    }
  }, []); // Removed dependency on `initialAppointmentDate` to avoid re-renders

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check for internet connectivity first
        const netInfo = await fetch(`${URL}/health`).catch(() => null);
        if (!netInfo) {
          Alert.alert(
            'Network Error',
            'No internet connection. Please check your network and try again.',
            [
              {
                text: 'Retry',
                onPress: () => fetchUserData(),
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ],
          );
          return;
        }

        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('LoginScreen');
          return;
        }

        // Fetch user profile with timeout
        const timeoutDuration = 10000; // 10 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

        try {
          const userProfileResponse = await fetch(`${URL}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!userProfileResponse.ok) {
            if (userProfileResponse.status === 401) {
              await AsyncStorage.removeItem('token');
              navigation.replace('LoginScreen');
              return;
            }
            const errorText = await userProfileResponse.text();
            throw new Error(
              `Error fetching user profile: ${userProfileResponse.statusText} - ${errorText}`,
            );
          }

          const userProfileData = await userProfileResponse.json();
          setUserName(userProfileData.name);

          // Fetch pets for the user
          const petsResponse = await fetch(`${URL}/pets`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!petsResponse.ok) {
            const errorText = await petsResponse.text();
            throw new Error(
              `Error fetching pets: ${petsResponse.statusText} - ${errorText}`,
            );
          }

          const petsData = await petsResponse.json();
          if (!Array.isArray(petsData)) {
            throw new Error('Invalid pets data format received');
          }

          setPets(petsData || []);
          if (petsData.length > 0) {
            const firstPet = petsData[0];
            setPetId(firstPet._id);
            setSelectedPet(firstPet);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error(
              'Request timed out. Please check your connection and try again.',
            );
          }
          throw error;
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to load your information. Please try again.',
          [
            {
              text: 'Retry',
              onPress: () => fetchUserData(),
            },
            {
              text: 'Go Back',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    };

    fetchUserData();
  }, []); // Ensure this effect only runs once when the component mounts

  const bookAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'Authentication Error',
          'You are not logged in. Please log in to book an appointment.',
        );
        return;
      }
      if (!petId) {
        Alert.alert(
          'Missing Information',
          'Please select a pet to book an appointment.',
        );
        return;
      }
      if (!appointmentType) {
        Alert.alert(
          'Missing Information',
          'Please select an appointment type.',
        );
        return;
      }
      if (!appointmentDate) {
        Alert.alert(
          'Missing Information',
          'Please select an appointment date.',
        );
        return;
      }
      // Create the base appointment data with only fields that exist in the model
      let appointmentData: any = {
        pet: petId,
        appointmentType,
        appointmentDate: appointmentDate.toISOString(), // send full ISO string
      };
      // Add grooming-specific fields if appointment type is Grooming
      if (appointmentType === 'Grooming') {
        appointmentData = {
          ...appointmentData,
          hairCut: hairCut ? [hairCut] : undefined, // Convert to array as per model
          groomingType,
          bathing:
            bathing && groomingType === 'bathing' ? [bathing] : undefined, // Convert to array as per model
        };
      }
      const response = await fetch(`${URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();
      if (response.ok) {
        // Format date for display
        const formattedDate = new Date(appointmentDate).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );
        // Get pet name
        const petName = selectedPet ? selectedPet.name : 'your pet';
        // Display a local notification for successful booking
        await displayBookingConfirmation(
          petName,
          appointmentType,
          formattedDate,
        );
        // Schedule a reminder notification for the day before and day of the appointment
        await scheduleAppointmentReminder(
          petName,
          appointmentType,
          appointmentDate,
          data.appointment?._id || data._id, // Use the appointment ID from the response
        );
        Alert.alert(
          'Success',
          'Appointment booked successfully. Our team will contact you for confirmation.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.replace
                  ? navigation.replace('HomeScreens')
                  : navigation.navigate('HomeScreens'),
            },
          ],
        );
      } else {
        let errorMsg =
          data.error || 'Unable to book appointment. Please try again later.';
        if (errorMsg.toLowerCase().includes('conflict')) {
          errorMsg = 'You already have an appointment at this time.';
        } else if (errorMsg.toLowerCase().includes('missing')) {
          errorMsg = 'Please fill all required appointment details.';
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while booking the appointment. Please try again.',
      );
    }
  };

  // Update handlePetSelection function
  const handlePetSelection = (value: string) => {
    setShowPetPicker(false); // Close the modal first
    if (value === 'addPet') {
      setTimeout(() => {
        navigation.navigate('AddPetScreen', {
          onPetAdded: async () => {
            // Fetch pets again after adding a new pet
            try {
              const token = await AsyncStorage.getItem('token');
              if (token) {
                const petsResponse = await fetch(`${URL}/pets`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (petsResponse.ok) {
                  const petsData = await petsResponse.json();
                  if (Array.isArray(petsData)) {
                    setPets(petsData);
                    if (petsData.length > 0) {
                      const newPet = petsData[petsData.length - 1]; // Get the last added pet
                      setPetId(newPet._id);
                      setSelectedPet(newPet);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error refreshing pets:', error);
            }
          },
        });
      }, 300); // Add small delay to let modal close animation finish
    } else {
      setPetId(value);
      const pet = pets.find(p => p._id === value) || null;
      setSelectedPet(pet);
    }
  };

  // We only need to render a form for Grooming type appointments
  // For other types, we'll just render basic information
  const renderForm = () => {
    if (appointmentType === 'Grooming') {
      return renderGroomingForm();
    }
  };

  const renderGroomingForm = () => {
    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Grooming Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Grooming Type</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowGroomingTypePicker(true)}>
            <Text style={styles.pickerButtonText}>
              {groomingType !== 'none'
                ? groomingType.charAt(0).toUpperCase() + groomingType.slice(1)
                : 'Select Grooming Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {groomingType !== 'none' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Hair Cut</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowHairCutPicker(true)}>
              <Text style={styles.pickerButtonText}>
                {hairCut
                  ? hairCut.charAt(0).toUpperCase() + hairCut.slice(1)
                  : 'Select Hair Cut'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {groomingType === 'bathing' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bathing Type</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowBathingPicker(true)}>
              <Text style={styles.pickerButtonText}>
                {bathing
                  ? bathing.charAt(0).toUpperCase() + bathing.slice(1)
                  : 'Select Bathing Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Handler for date selection
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(appointmentDate.getHours());
      newDate.setMinutes(appointmentDate.getMinutes());
      setAppointmentDate(newDate);

      if (Platform.OS === 'android') {
        setCurrentMode('time');
      }
    }
  };

  // Handler for time selection
  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      const newDate = new Date(appointmentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAppointmentDate(newDate);

      if (Platform.OS === 'android') {
        setDateTimeModalVisible(false);
      }
    }
  };

  const showDateTimePicker = () => {
    setCurrentMode('date');
    setDateTimeModalVisible(true);
  };

  const renderDateTimeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={dateTimeModalVisible}
      onRequestClose={() => setDateTimeModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDateTimeModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {currentMode === 'date' ? 'Select Date' : 'Select Time'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (currentMode === 'date') {
                  setCurrentMode('time');
                } else {
                  setDateTimeModalVisible(false);
                }
              }}>
              <Text style={styles.doneButton}>
                {currentMode === 'date' ? 'Next' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={appointmentDate}
            mode={currentMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={currentMode === 'date' ? onDateChange : onTimeChange}
            style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
            minimumDate={currentMode === 'date' ? new Date() : undefined}
          />
        </View>
      </View>
    </Modal>
  );

  // Render function for Picker with placeholder and icon
  const renderPicker = (value, onValueChange, items, placeholder) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        style={styles.picker}
        onValueChange={onValueChange}>
        <Picker.Item label={placeholder} value="" color="#999" />
        {items.map(item => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={item.color || '#333'}
          />
        ))}
      </Picker>
      <Ionicons
        name="chevron-down"
        size={20}
        color="#666"
        style={styles.pickerIcon}
      />
    </View>
  );

  const renderPickerModal = (
    visible,
    setVisible,
    selectedValue,
    onValueChange,
    items,
    title,
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
              }}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={selectedValue}
            style={styles.iosPickerModal}
            onValueChange={onValueChange}>
            {items}
          </Picker>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <Text style={styles.mainTitle}>Book an Appointment</Text>
          {/* Common Fields Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.iosInput}
                value={userName}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Pet Selection - Wheel Style */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Pet</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPetPicker(true)}>
                <Text style={styles.pickerButtonText}>
                  {selectedPet ? selectedPet.name : 'Select Pet'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Appointment Type Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Appointment Type</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowAppointmentTypePicker(true)}>
                <Text style={styles.pickerButtonText}>
                  {appointmentType || 'Select Appointment Type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date and Time Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Appointment Date & Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={showDateTimePicker}>
                <Text style={styles.pickerButtonText}>
                  {appointmentDate
                    ? appointmentDate.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select Date & Time'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Form Section */}
          {renderForm()}

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.iosButton}
              onPress={bookAppointment}>
              <Text style={styles.iosButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modals */}
        {/* Pet Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPetPicker}
          onRequestClose={() => setShowPetPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPetPicker(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Pet</Text>
                <TouchableOpacity onPress={() => setShowPetPicker(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={petId}
                style={styles.iosPickerModal}
                onValueChange={handlePetSelection}>
                {pets.map(pet => (
                  <Picker.Item
                    key={pet._id}
                    label={pet.name}
                    value={pet._id}
                    color="#333"
                  />
                ))}
                <Picker.Item
                  key="addPet"
                  label="+ Add New Pet"
                  value="addPet"
                  color="#FB6A43"
                />
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Grooming Form Modals */}
        {renderPickerModal(
          showGroomingTypePicker,
          setShowGroomingTypePicker,
          groomingType,
          setGroomingType,
          [
            <Picker.Item key="none" label="None" value="none" color="#333" />,
            <Picker.Item
              key="full"
              label="Full Grooming"
              value="full"
              color="#333"
            />,
            <Picker.Item
              key="bathing"
              label="Bathing"
              value="bathing"
              color="#333"
            />,
          ],
          'Select Grooming Type',
        )}

        {renderPickerModal(
          showHairCutPicker,
          setShowHairCutPicker,
          hairCut,
          setHairCut,
          [
            <Picker.Item
              key="select"
              label="Select Hair Cut"
              value=""
              color="#999"
            />,
            <Picker.Item
              key="facecut"
              label="Face Cut"
              value="facecut"
              color="#333"
            />,
            <Picker.Item
              key="hygienecut"
              label="Hygiene Cut"
              value="hygienecut"
              color="#333"
            />,
            <Picker.Item
              key="fullbodycut"
              label="Full Body Cut"
              value="fullbodycut"
              color="#333"
            />,
          ],
          'Select Hair Cut',
        )}

        {renderPickerModal(
          showBathingPicker,
          setShowBathingPicker,
          bathing,
          setBathing,
          [
            <Picker.Item
              key="select"
              label="Select Bathing Type"
              value=""
              color="#999"
            />,
            <Picker.Item
              key="antitickbath"
              label="Anti Tick Bath"
              value="antitickbath"
              color="#333"
            />,
            <Picker.Item
              key="medicatedbath"
              label="Medicated Bath"
              value="medicatedbath"
              color="#333"
            />,
            <Picker.Item
              key="routinebath"
              label="Routine Bath"
              value="routinebath"
              color="#333"
            />,
          ],
          'Select Bathing Type',
        )}

        {/* Appointment Type Picker - Moved here for better organization */}
        {renderPickerModal(
          showAppointmentTypePicker,
          setShowAppointmentTypePicker,
          appointmentType,
          setAppointmentType,
          [
            <Picker.Item
              key="treatment"
              label="Treatment"
              value="Treatment"
              color="#333"
            />,
            <Picker.Item
              key="grooming"
              label="Grooming"
              value="Grooming"
              color="#333"
            />,
            <Picker.Item
              key="vaccination"
              label="Vaccination"
              value="Vaccination"
              color="#333"
            />,
            <Picker.Item
              key="surgery"
              label="Surgery"
              value="Surgery"
              color="#333"
            />,
          ],
          'Select Appointment Type',
        )}

        {/* Date Time Modal */}
        {renderDateTimeModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  iosInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  iosButton: {
    backgroundColor: '#FB6A43',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  iosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    fontSize: 17,
    color: '#666',
  },
  doneButton: {
    fontSize: 17,
    color: '#FB6A43',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  pickerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  picker: {
    height: 40,
    width: '100%',
    color: '#333',
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    zIndex: 2,
  },
  iosPickerModal: {
    height: 30,
    width: '100%',
    marginBottom: 30,
  },
  formGroupLast: {
    marginBottom: 0,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AppointmentBookingScreen;
