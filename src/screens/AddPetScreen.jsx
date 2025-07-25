import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioForm from 'react-native-simple-radio-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const AddPetScreen = props => {
  const navigation = useNavigation();
  const [petType, setPetType] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePickerDOB, setShowDatePickerDOB] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [petNo, setPetNo] = useState('');
  const [hairCut, setHairCut] = useState([]);
  const [groomingType, setGroomingType] = useState('');
  const [bathing, setBathing] = useState('');
  const [treatmentDone, setTreatmentDone] = useState(false);
  const [lastTreatmentDate, setLastTreatmentDate] = useState(new Date());
  const [showDatePickerLastTreatment, setShowDatePickerLastTreatment] =
    useState(false);
  const [nextTreatmentDate, setNextTreatmentDate] = useState(new Date());
  const [showDatePickerNextTreatment, setShowDatePickerNextTreatment] =
    useState(false);
  const [vaccinationType, setVaccinationType] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState(new Date());
  const [showDatePickerVaccination, setShowDatePickerVaccination] =
    useState(false);
  const [nextVaccinationDate, setNextVaccinationDate] = useState(new Date());
  const [showDatePickerNextVaccination, setShowDatePickerNextVaccination] =
    useState(false);
  const [petImage, setPetImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState('date');

  const vaccinationOptions = [
    {label: 'Vencosix', value: 'vencosix'},
    {label: 'Vencomax II', value: 'vencomaxII'},
    {label: 'ARV', value: 'ARV'},
    {label: 'Defense Bronch', value: 'DefenceBrouch'},
  ];

  useEffect(() => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    setAge(age.toString());
  }, [dateOfBirth]);

  useEffect(() => {
    const generatePetNo = () => {
      const randomNo = Math.floor(100000 + Math.random() * 900000).toString();
      setPetNo(randomNo);
    };
    generatePetNo();
  }, []);

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
          setPetImage(source);
        }
      }
    });
  };

  const addPet = async () => {
    console.log('=== ADD PET FUNCTION CALLED ===');

    try {
      // Enhanced validation with detailed logging
      console.log('Validating form fields...');
      console.log('petType:', petType);
      console.log('name:', name);
      console.log('gender:', gender);
      console.log('weight:', weight);
      console.log('breed:', breed);
      console.log('color:', color);

      if (!petType) {
        console.log('ERROR: Missing petType');
        Alert.alert('Missing Information', 'Please select a pet type.');
        return;
      }

      if (!name || name.trim() === '') {
        console.log('ERROR: Missing name');
        Alert.alert('Missing Information', "Please enter your pet's name.");
        return;
      }

      if (!gender) {
        console.log('ERROR: Missing gender');
        Alert.alert('Missing Information', "Please select your pet's gender.");
        return;
      }

      if (!weight || weight.trim() === '') {
        console.log('ERROR: Missing weight');
        Alert.alert('Missing Information', "Please enter your pet's weight.");
        return;
      }

      if (!breed || breed.trim() === '') {
        console.log('ERROR: Missing breed');
        Alert.alert('Missing Information', "Please enter your pet's breed.");
        return;
      }

      if (!color || color.trim() === '') {
        console.log('ERROR: Missing color');
        Alert.alert('Missing Information', "Please enter your pet's color.");
        return;
      }

      console.log('Getting token from AsyncStorage...');
      const token = await AsyncStorage.getItem('token');
      console.log('Token exists:', !!token);

      if (!token) {
        console.log('ERROR: No token found');
        Alert.alert(
          'Error',
          'Authentication token not found. Please log in again.',
        );
        return;
      }

      console.log('Creating FormData...');
      const formData = new FormData();

      // Add all form fields with logging
      formData.append('petType', petType);
      formData.append('name', name.trim());
      formData.append('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('weight', weight.trim());
      formData.append('breed', breed.trim());
      formData.append('color', color.trim());
      formData.append('pet_no', petNo);

      console.log('Added basic fields to FormData');

      // Optional fields
      if (hairCut && hairCut.length > 0) {
        console.log('Adding hairCut:', hairCut);
        hairCut.forEach(cut => {
          formData.append('hairCut', cut);
        });
      }

      if (groomingType) {
        console.log('Adding groomingType:', groomingType);
        formData.append('groomingType', groomingType);
        if (groomingType === 'bathing' && bathing) {
          formData.append('bathing', bathing);
        }
      }

      formData.append('treatmentDone', treatmentDone ? 'Yes' : 'No');
      formData.append(
        'lastTreatmentDate',
        lastTreatmentDate.toISOString().split('T')[0],
      );
      formData.append(
        'nextTreatmentDate',
        nextTreatmentDate.toISOString().split('T')[0],
      );

      if (vaccinationType) {
        console.log('Adding vaccinationType:', vaccinationType);
        formData.append('vaccinationType', vaccinationType);
      }

      formData.append(
        'vaccinationDate',
        vaccinationDate.toISOString().split('T')[0],
      );
      formData.append(
        'nextVaccinationDate',
        nextVaccinationDate.toISOString().split('T')[0],
      );

      if (petImage && petImage.uri) {
        console.log('Adding petImage:', petImage.uri);
        formData.append('petImage', {
          uri: petImage.uri,
          type: 'image/jpeg',
          name: 'petImage.jpg',
        });
      }

      console.log('FormData created successfully');
      console.log('Making request to:', `${URL}/pets`);

      const response = await fetch(`${URL}/pets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response received - Status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries()),
      );

      let data;
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('JSON Response data:', data);
      } else {
        const textResponse = await response.text();
        console.log('Text Response:', textResponse);
        data = {error: textResponse};
      }

      if (response.ok) {
        console.log('SUCCESS: Pet added successfully');
        Alert.alert('Success', 'Pet added successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);

        // Call callback if provided
        if (props.route?.params?.onPetAdded) {
          console.log('Calling onPetAdded callback');
          props.route.params.onPetAdded();
        }
      } else {
        console.log('ERROR: Server responded with error');
        console.log('Error status:', response.status);
        console.log('Error data:', data);

        let errorMsg =
          data.error ||
          data.message ||
          'Unable to add the pet. Please try again later.';

        if (errorMsg.toLowerCase().includes('duplicate')) {
          errorMsg = 'Pet already exists.';
        } else if (errorMsg.toLowerCase().includes('missing')) {
          errorMsg = 'Please fill all required pet details.';
        } else if (errorMsg.toLowerCase().includes('unauthorized')) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (errorMsg.toLowerCase().includes('token')) {
          errorMsg = 'Session expired. Please log in again.';
        }

        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      let errorMessage = 'An unexpected error occurred while adding the pet.';

      if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage =
            'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Unable to connect to server. Please check your internet connection.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Server response format error. Please try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const handleHairCutSelection = selectedItems => {
    if (selectedItems.includes('fullbodycut') && selectedItems.length > 1) {
      Alert.alert(
        'Error',
        'Full Body Cut cannot be selected with other options',
      );
      return;
    }
    setHairCut(selectedItems);
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = selectedDate || dateOfBirth;
      setDateOfBirth(currentDate);

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
      <View style={styles.datePickerModalOverlay}>
        <View style={styles.datePickerModalContent}>
          <View style={styles.datePickerModalHeader}>
            <TouchableOpacity onPress={() => setDateTimeModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => setDateTimeModalVisible(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
          />
        </View>
      </View>
    </Modal>
  );

  const renderForm = () => (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.Name}>Add Pet</Text>
      </View>
      {/* Personal Details */}
      <Text style={styles.sectionTitle}>Personal Details</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={showDateTimePicker}>
        <Text style={styles.datePickerButtonText}>
          {dateOfBirth.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Icon name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {renderDateTimeModal()}

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} value={age} editable={false} />
      <Text style={styles.label}>Gender</Text>
      <RadioForm
        radio_props={[
          {label: 'Male', value: 'M'},
          {label: 'Female', value: 'F'},
        ]}
        initial={0}
        onPress={value => setGender(value)}
        formHorizontal={true}
        labelHorizontal={true}
        buttonColor={'#FB6A43'}
        selectedButtonColor={'#FB6A43'}
        labelStyle={styles.radioLabel}
      />
      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Breed</Text>
      <TextInput style={styles.input} value={breed} onChangeText={setBreed} />
      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} />
      <Text style={styles.label}>Pet Number</Text>
      <TextInput style={styles.input} value={petNo} editable={false} />
      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.buttonText}>Select Pet Image</Text>
      </TouchableOpacity>
      {petImage && <Image source={petImage} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={addPet}>
        <Text style={styles.buttonText}>Add Pet</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <SafeAreaView style={styles.safeArea}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Pet Type</Text>
              <TouchableOpacity
                style={styles.petTypeButton}
                onPress={() => {
                  setPetType('Canine');
                  setModalVisible(false);
                }}>
                <Icon name="dog" size={30} color="#FB6A43" />
                <Text style={styles.petTypeText}>Canine</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.petTypeButton}
                onPress={() => {
                  setPetType('Feline');
                  setModalVisible(false);
                }}>
                <Icon name="cat" size={30} color="#FB6A43" />
                <Text style={styles.petTypeText}>Feline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {petType && (
          <FlatList
            style={styles.container}
            data={[{key: 'form'}]}
            renderItem={renderForm}
            keyExtractor={item => item.key}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFDFD',
  },
  infoContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    marginTop: -30,
  },
  Name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
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
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 16,
    marginRight: 20,
  },
  dropDown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  petTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FB6A43',
    marginBottom: 20,
  },
  petTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  petTypeText: {
    fontSize: 18,
    marginLeft: 10,
  },
  iosDatePicker: {
    backgroundColor: 'white',
    height: 200,
  },
  datePickerButton: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  datePickerModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    fontSize: 16,
    color: '#FB6A43',
  },
  doneButton: {
    fontSize: 16,
    color: '#FB6A43',
  },
});

export default AddPetScreen;
