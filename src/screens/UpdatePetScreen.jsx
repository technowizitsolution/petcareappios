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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActionSheetIOS,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import RadioForm from 'react-native-simple-radio-button';
import MultiSelect from 'react-native-multiple-select';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import uuid from 'react-native-uuid';

const URL = 'https://petcare-1c443.el.r.appspot.com';

// Replace generateId with UUID
function generateId() {
  return uuid.v4();
}

// Helper to ensure all vaccinations have a unique _id
function ensureVaccinationIds(vaccinations) {
  return vaccinations.map(v => ({
    ...v,
    _id: v._id || generateId(),
  }));
}

// Helper to check for duplicate or missing keys in vaccinations
function checkVaccinationKeys(vaccinations) {
  const seen = new Set();
  let hasProblem = false;
  vaccinations.forEach((v, idx) => {
    if (!v._id) {
      console.warn('Vaccination at index', idx, 'is missing _id:', v);
      hasProblem = true;
    } else if (seen.has(v._id)) {
      console.warn('Duplicate vaccination _id found:', v._id, v);
      hasProblem = true;
    } else {
      seen.add(v._id);
    }
  });
  if (hasProblem) {
    console.warn(
      'Vaccination keys must be unique and non-empty! This will crash the app.',
    );
  }
}

const UpdatePetScreen = ({route}) => {
  const {pet} = route.params;
  const navigation = useNavigation();

  // Set initial state from route.params.pet for immediate display
  const [petType, setPetType] = useState(pet.petType || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(pet.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    pet.dateOfBirth ? safeDate(pet.dateOfBirth) : new Date(),
  );
  const [showDatePickerDOB, setShowDatePickerDOB] = useState(false);
  const [age, setAge] = useState(pet.age || '');
  const [gender, setGender] = useState(pet.gender || '');
  const [weight, setWeight] = useState(pet.weight ? String(pet.weight) : '');
  const [breed, setBreed] = useState(pet.breed || '');
  const [color, setColor] = useState(pet.color || '');
  const [petNo, setPetNo] = useState(pet.pet_no || '');
  const [hairCut, setHairCut] = useState(pet.hairCut || []);
  const [groomingType, setGroomingType] = useState(pet.groomingType || 'full');
  const [bathing, setBathing] = useState(pet.bathing || '');
  const [treatmentType, setTreatmentType] = useState(pet.treatmentType || '');
  const [lastTreatmentDate, setLastTreatmentDate] = useState(
    pet.lastTreatmentDate ? safeDate(pet.lastTreatmentDate) : new Date(),
  );
  const [showDatePickerLastTreatment, setShowDatePickerLastTreatment] =
    useState(false);
  const [nextTreatmentDate, setNextTreatmentDate] = useState(
    pet.nextTreatmentDate ? safeDate(pet.nextTreatmentDate) : new Date(),
  );
  const [showDatePickerNextTreatment, setShowDatePickerNextTreatment] =
    useState(false);
  // Simple vaccination (primary)
  const [simpleVaccinationType, setSimpleVaccinationType] = useState(
    pet.vaccinationType || '',
  );
  const [simpleVaccinationDate, setSimpleVaccinationDate] = useState(
    pet.vaccinationDate ? safeDate(pet.vaccinationDate) : new Date(),
  );
  const [simpleNextVaccinationDate, setSimpleNextVaccinationDate] = useState(
    pet.nextVaccinationDate ? safeDate(pet.nextVaccinationDate) : new Date(),
  );
  // Additional vaccinations array
  const [vaccinations, setVaccinations] = useState(
    pet.vaccinations &&
      Array.isArray(pet.vaccinations) &&
      pet.vaccinations.length > 0
      ? pet.vaccinations.map(v => ({
          ...v,
          _id: v._id || generateId(),
        }))
      : [],
  );
  // Store original vaccinations when fetching from backend
  const [originalVaccinations, setOriginalVaccinations] = useState([]);
  // (Treatments and surgeries state removed as per requirements)

  // Track removed IDs
  // No need to track removedVaccinationIds for immediate deletion
  // Remove vaccination by id or index (for new unsaved ones)
  const removeVaccination = async (id, idx) => {
    if (id) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }
        const response = await fetch(
          `${URL}/pets/${pet._id}/vaccinations/${id}`,
          {
            method: 'DELETE',
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        if (!response.ok) {
          let errorText = '';
          try {
            const data = await response.json();
            errorText = data.error || JSON.stringify(data);
          } catch (e) {
            errorText = await response.text();
          }
          Alert.alert('Error', `Failed to delete vaccination.\n${errorText}`);
          return;
        }
        setVaccinations(prev => prev.filter(v => v._id !== id));
      } catch (err) {
        Alert.alert(
          'Error',
          `Failed to delete vaccination.\n${
            err && err.message ? err.message : err
          }`,
        );
      }
    } else {
      setVaccinations(prev => prev.filter((_, i) => i !== idx));
    }
  };
  // (Treatments and surgeries removal logic removed as per requirements)

  // Example UI for removing treatments:
  // {treatments.map((t, idx) => (
  //   <View key={t._id || idx} style={{flexDirection: 'row', alignItems: 'center'}}>
  //     <Text>{t.treatmentType} - {t.treatmentDate ? t.treatmentDate.toString().slice(0, 10) : ''}</Text>
  //     <TouchableOpacity onPress={() => removeTreatment(t._id, idx)}>
  //       <Text style={{color: 'red', marginLeft: 10}}>Remove</Text>
  //     </TouchableOpacity>
  //   </View>
  // ))}

  // Example UI for removing surgeries:
  // {surgeries.map((s, idx) => (
  //   <View key={s._id || idx} style={{flexDirection: 'row', alignItems: 'center'}}>
  //     <Text>{s.surgeryType} - {s.surgeryDate ? s.surgeryDate.toString().slice(0, 10) : ''}</Text>
  //     <TouchableOpacity onPress={() => removeSurgery(s._id, idx)}>
  //       <Text style={{color: 'red', marginLeft: 10}}>Remove</Text>
  //     </TouchableOpacity>
  //   </View>
  // ))}

  // Example UI for removing vaccinations (add this to your render/return block):
  // {vaccinations.map((v, idx) => (
  //   <View key={v._id || idx} style={{flexDirection: 'row', alignItems: 'center'}}>
  //     <Text>{v.vaccinationType} - {v.vaccinationDate ? v.vaccinationDate.toString().slice(0, 10) : ''}</Text>
  //     <TouchableOpacity onPress={() => removeVaccination(v._id)}>
  //       <Text style={{color: 'red', marginLeft: 10}}>Remove</Text>
  //     </TouchableOpacity>
  //   </View>
  // ))}

  // Do the same for treatments and surgeries using removeTreatment and removeSurgery
  // Fetch latest pet data (including vaccinations) on mount
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          return;
        }
        // Use pet._id from route.params.pet, fallback to pet.id
        const petId = pet._id || pet.id;
        if (!petId) {
          return;
        }
        const response = await fetch(`${URL}/pets/${petId}`, {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setPetType(data.petType || '');
        setName(data.name || '');
        setDateOfBirth(
          data.dateOfBirth ? safeDate(data.dateOfBirth) : new Date(),
        );
        setAge(data.age || '');
        setGender(data.gender || '');
        setWeight(data.weight ? String(data.weight) : '');
        setBreed(data.breed || '');
        setColor(data.color || '');
        setPetNo(data.pet_no || '');
        setHairCut(data.hairCut || []);
        setGroomingType(data.groomingType || 'full');
        setBathing(data.bathing || '');
        setTreatmentType(data.treatmentType || 'N/A');
        setLastTreatmentDate(
          data.lastTreatmentDate
            ? safeDate(data.lastTreatmentDate)
            : new Date(),
        );
        setNextTreatmentDate(
          data.nextTreatmentDate
            ? safeDate(data.nextTreatmentDate)
            : new Date(),
        );
        setPetImage(data.petImage || null);
        // Set simple vaccination fields
        setSimpleVaccinationType(data.vaccinationType || '');
        setSimpleVaccinationDate(
          data.vaccinationDate ? safeDate(data.vaccinationDate) : new Date(),
        );
        setOriginalSimpleVaccinationDate(
          data.vaccinationDate ? safeDate(data.vaccinationDate) : null,
        );
        setSimpleNextVaccinationDate(
          data.nextVaccinationDate
            ? safeDate(data.nextVaccinationDate)
            : new Date(),
        );
        setOriginalSimpleNextVaccinationDate(
          data.nextVaccinationDate ? safeDate(data.nextVaccinationDate) : null,
        );
        // Additional vaccinations array
        setVaccinations(
          data.vaccinations &&
            Array.isArray(data.vaccinations) &&
            data.vaccinations.length > 0
            ? ensureVaccinationIds(
                data.vaccinations.map(v => ({
                  ...v,
                  vaccinationDate: v.vaccinationDate
                    ? safeDate(v.vaccinationDate)
                    : null,
                  nextVaccinationDate: v.nextVaccinationDate
                    ? safeDate(v.nextVaccinationDate)
                    : null,
                })),
              )
            : [],
        );
        setOriginalVaccinations(
          data.vaccinations &&
            Array.isArray(data.vaccinations) &&
            data.vaccinations.length > 0
            ? ensureVaccinationIds(
                data.vaccinations.map(v => ({
                  ...v,
                  vaccinationDate: v.vaccinationDate
                    ? safeDate(v.vaccinationDate)
                    : null,
                  nextVaccinationDate: v.nextVaccinationDate
                    ? safeDate(v.nextVaccinationDate)
                    : null,
                })),
              )
            : [],
        );
      } catch (err) {
        console.error('Error fetching pet:', err);
      }
    };
    fetchPet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // For new vaccination entry
  const [vaccinationType, setVaccinationType] = useState('');
  const [showDatePickerVaccination, setShowDatePickerVaccination] =
    useState(false);
  const [showDatePickerNextVaccination, setShowDatePickerNextVaccination] =
    useState(false);
  const [petImage, setPetImage] = useState(pet.petImage);
  // Show/hide add vaccination form
  const [showAddVaccinationForm, setShowAddVaccinationForm] = useState(false);
  const [addVaccinationDate, setAddVaccinationDate] = useState(new Date());
  const [addNextVaccinationDate, setAddNextVaccinationDate] = useState(
    new Date(),
  );
  const [showAddVaccinationDatePicker, setShowAddVaccinationDatePicker] =
    useState(false);
  const [
    showAddNextVaccinationDatePicker,
    setShowAddNextVaccinationDatePicker,
  ] = useState(false);

  // Helper to safely parse date
  function safeDate(d) {
    if (!d) {
      return new Date();
    }
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  const handleColorChange = text => {
    // Trim whitespace and limit length for better Samsung compatibility
    const cleanedText = text.trim();
    if (cleanedText.length <= 50) {
      setColor(cleanedText);
    }
  };

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = {uri: response.assets[0].uri};
        setPetImage(source);
      }
    });
  };

  const updatePet = async () => {
    try {
      if (!name) {
        Alert.alert('Missing Information', "Please enter your pet's name.");
        return;
      }
      if (!dateOfBirth) {
        Alert.alert(
          'Missing Information',
          "Please select your pet's date of birth.",
        );
        return;
      }
      if (!gender) {
        Alert.alert('Missing Information', "Please select your pet's gender.");
        return;
      }
      if (!weight) {
        Alert.alert('Missing Information', "Please enter your pet's weight.");
        return;
      }
      if (!breed) {
        Alert.alert('Missing Information', "Please enter your pet's breed.");
        return;
      }
      if (!color) {
        Alert.alert('Missing Information', "Please enter your pet's color.");
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const formData = new FormData();
      formData.append('petType', petType);
      formData.append('name', name);
      formData.append('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('weight', weight);
      formData.append('breed', breed);
      formData.append('color', color);
      formData.append('pet_no', petNo);

      // Add hair cut only if it's not empty
      if (hairCut && hairCut.length > 0) {
        hairCut.forEach((cut, index) => {
          formData.append('hairCut', cut);
        });
      }

      formData.append('groomingType', groomingType);
      if (groomingType === 'bathing') {
        formData.append('bathing', bathing);
      }
      formData.append('treatmentType', treatmentType);
      formData.append(
        'lastTreatmentDate',
        lastTreatmentDate instanceof Date && !isNaN(lastTreatmentDate)
          ? lastTreatmentDate.toISOString().split('T')[0]
          : '',
      );
      formData.append(
        'nextTreatmentDate',
        nextTreatmentDate instanceof Date && !isNaN(nextTreatmentDate)
          ? nextTreatmentDate.toISOString().split('T')[0]
          : '',
      );

      // Add simple vaccination fields
      formData.append('vaccinationType', simpleVaccinationType);
      formData.append(
        'vaccinationDate',
        simpleVaccinationDate instanceof Date && !isNaN(simpleVaccinationDate)
          ? simpleVaccinationDate.toISOString().split('T')[0]
          : originalSimpleVaccinationDate instanceof Date &&
            !isNaN(originalSimpleVaccinationDate)
          ? originalSimpleVaccinationDate.toISOString().split('T')[0]
          : '',
      );
      formData.append(
        'nextVaccinationDate',
        simpleNextVaccinationDate instanceof Date &&
          !isNaN(simpleNextVaccinationDate)
          ? simpleNextVaccinationDate.toISOString().split('T')[0]
          : originalSimpleNextVaccinationDate instanceof Date &&
            !isNaN(originalSimpleNextVaccinationDate)
          ? originalSimpleNextVaccinationDate.toISOString().split('T')[0]
          : '',
      );
      // Add additional vaccinations array if present
      if (vaccinations && vaccinations.length > 0) {
        // Always send as an array, even if only one vaccination
        formData.append(
          'vaccinations',
          JSON.stringify(
            vaccinations.map((v, idx) => {
              const original = originalVaccinations[idx] || {};
              // Remove undefined fields and ensure only plain values
              return {
                vaccinationType:
                  v.vaccinationType || original.vaccinationType || '',
                vaccinationDate:
                  v.vaccinationDate instanceof Date && !isNaN(v.vaccinationDate)
                    ? v.vaccinationDate.toISOString().split('T')[0]
                    : typeof v.vaccinationDate === 'string' && v.vaccinationDate
                    ? v.vaccinationDate
                    : original.vaccinationDate instanceof Date &&
                      !isNaN(original.vaccinationDate)
                    ? original.vaccinationDate.toISOString().split('T')[0]
                    : typeof original.vaccinationDate === 'string' &&
                      original.vaccinationDate
                    ? original.vaccinationDate
                    : '',
                nextVaccinationDate:
                  v.nextVaccinationDate instanceof Date &&
                  !isNaN(v.nextVaccinationDate)
                    ? v.nextVaccinationDate.toISOString().split('T')[0]
                    : typeof v.nextVaccinationDate === 'string' &&
                      v.nextVaccinationDate
                    ? v.nextVaccinationDate
                    : original.nextVaccinationDate instanceof Date &&
                      !isNaN(original.nextVaccinationDate)
                    ? original.nextVaccinationDate.toISOString().split('T')[0]
                    : typeof original.nextVaccinationDate === 'string' &&
                      original.nextVaccinationDate
                    ? original.nextVaccinationDate
                    : '',
              };
            }),
          ),
        );
      }
      if (petImage && petImage.uri) {
        formData.append('petImage', {
          uri: petImage.uri,
          type: 'image/jpeg',
          name: 'petImage.jpg',
        });
      }

      const response = await fetch(`${URL}/pets/${pet._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
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

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Pet updated successfully');
        Alert.alert('Success', 'Pet updated successfully');
        navigation.goBack();
      } else {
        console.log('Error:', data.error || data);
        Alert.alert(
          'Error',
          data.error || 'Unable to update the pet. Please try again later.',
        );
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while updating the pet. Please try again.',
      );
    }
  };

  const vaccinationTypeOptions = [
    {label: 'Select Vaccination Type', value: ''},
    {label: 'Vencosix', value: 'vencosix'},
    {label: 'Vencomax II', value: 'vencomaxII'},
    {label: 'Defense Bronch', value: 'DefenceBrouch'},
    {label: 'ARV', value: 'ARV'},
    {label: 'Ronvac', value: 'Ronvac'},
  ];

  const showVaccinationTypeActionSheet = (selected, setSelected) => {
    const options = vaccinationTypeOptions.map(opt => opt.label);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex !== 0) {
          setSelected(vaccinationTypeOptions[buttonIndex].value);
        }
      },
    );
  };

  // Helper to create a blank vaccination row
  function createEmptyVaccination() {
    return {
      _id: generateId(),
      vaccinationType: '',
      vaccinationDate: new Date(),
      nextVaccinationDate: new Date(),
    };
  }

  const renderForm = () => (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FDFDFD'}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.Name}>Update Pet</Text>
          </View>
          {/* Personal Details */}
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.label}>Pet Type</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <TextInput style={styles.input} value={petType} editable={false} />
          </TouchableOpacity>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter pet name"
            placeholderTextColor="#999"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="words"
            textContentType="name"
            importantForAutofill="no"
            maxLength={50}
            returnKeyType="next"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => setShowDatePickerDOB(true)}>
            <TextInput
              style={styles.input}
              value={dateOfBirth.toISOString().split('T')[0]}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <IOSDatePickerModal
              visible={showDatePickerDOB}
              value={dateOfBirth}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              onCancel={() => setShowDatePickerDOB(false)}
            />
          ) : (
            showDatePickerDOB && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePickerDOB(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
              />
            )
          )}
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
            placeholder="Enter weight (kg)"
            placeholderTextColor="#999"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            textContentType="none"
            importantForAutofill="no"
            maxLength={10}
            returnKeyType="next"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="Enter pet breed"
            placeholderTextColor="#999"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="words"
            textContentType="none"
            importantForAutofill="no"
            maxLength={50}
            returnKeyType="next"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={handleColorChange}
            placeholder="Enter pet color (e.g., Brown, Black, White)"
            placeholderTextColor="#999"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="words"
            textContentType="none"
            importantForAutofill="no"
            maxLength={50}
            returnKeyType="next"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.label}>Pet Number</Text>
          <TextInput style={styles.input} value={petNo} editable={false} />
          <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
            <Text style={styles.buttonText}>Select Pet Image</Text>
          </TouchableOpacity>
          {petImage && <Image source={petImage} style={styles.image} />}
          {/* Grooming Details */}
          <Text style={styles.sectionTitle}>Grooming Details</Text>
          <Text style={styles.label}>Hair Cut (Optional)</Text>
          <MultiSelect
            items={[
              {id: 'facecut', name: 'Face Cut'},
              {id: 'hygienecut', name: 'Hygiene Cut'},
              {id: 'fullbodycut', name: 'Full Body Cut'},
            ]}
            uniqueKey="id"
            onSelectedItemsChange={selectedItems => setHairCut(selectedItems)}
            selectedItems={hairCut}
            selectText="Pick Hair Cut"
            searchInputPlaceholderText="Search Hair Cuts..."
            tagRemoveIconColor="#FB6A43"
            tagBorderColor="#FB6A43"
            tagTextColor="#FB6A43"
            selectedItemTextColor="#FB6A43"
            selectedItemIconColor="#FB6A43"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={styles.searchInput}
            submitButtonColor="#FB6A43"
            submitButtonText="Submit"
          />
          <Text style={styles.label}>Grooming Type</Text>
          <RadioForm
            radio_props={[
              {label: 'Full', value: 'full'},
              {label: 'Bathing', value: 'bathing'},
            ]}
            initial={0}
            onPress={value => setGroomingType(value)}
            formHorizontal={true}
            labelHorizontal={true}
            buttonColor={'#FB6A43'}
            selectedButtonColor={'#FB6A43'}
            labelStyle={styles.radioLabel}
          />
          {groomingType === 'bathing' && (
            <>
              <Text style={styles.label}>Bathing</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  style={styles.dropDown}
                  selectedValue={bathing}
                  onValueChange={(itemValue, itemIndex) =>
                    setBathing(itemValue)
                  }>
                  <Picker.Item label="Anti Tick Bath" value="anti tick bath" />
                  <Picker.Item label="Medicated Bath" value="medicated bath" />
                  <Picker.Item label="Routine Bath" value="routine bath" />
                </Picker>
              </View>
            </>
          )}
          {/* Treatment Details */}
          <Text style={styles.sectionTitle}>Treatment Details</Text>
          <Text style={styles.label}>Treatment Type</Text>
          <TextInput
            style={styles.input}
            value={treatmentType}
            onChangeText={setTreatmentType}
            placeholder="Enter treatment type (e.g., Antibiotic, Deworming)"
            placeholderTextColor="#999"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="words"
            textContentType="none"
            importantForAutofill="no"
            maxLength={50}
            returnKeyType="next"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.label}>Last Treatment Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePickerLastTreatment(true)}>
            <TextInput
              style={styles.input}
              value={lastTreatmentDate.toISOString().split('T')[0]}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <IOSDatePickerModal
              visible={showDatePickerLastTreatment}
              value={lastTreatmentDate}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setLastTreatmentDate(selectedDate);
                }
              }}
              onCancel={() => setShowDatePickerLastTreatment(false)}
            />
          ) : (
            showDatePickerLastTreatment && (
              <DateTimePicker
                value={lastTreatmentDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePickerLastTreatment(false);
                  if (selectedDate) {
                    setLastTreatmentDate(selectedDate);
                  }
                }}
              />
            )
          )}
          <Text style={styles.label}>Next Treatment Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePickerNextTreatment(true)}>
            <TextInput
              style={styles.input}
              value={nextTreatmentDate.toISOString().split('T')[0]}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <IOSDatePickerModal
              visible={showDatePickerNextTreatment}
              value={nextTreatmentDate}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setNextTreatmentDate(selectedDate);
                }
              }}
              onCancel={() => setShowDatePickerNextTreatment(false)}
            />
          ) : (
            showDatePickerNextTreatment && (
              <DateTimePicker
                value={nextTreatmentDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePickerNextTreatment(false);
                  if (selectedDate) {
                    setNextTreatmentDate(selectedDate);
                  }
                }}
              />
            )
          )}
          {/* Additional Treatments and Surgeries removed as per user request */}
          {/* Vaccination Details */}
          <Text style={styles.sectionTitle}>Vaccination Details</Text>
          {/* Simple vaccination fields (always shown) */}
          <Text style={styles.label}>Vaccination Type</Text>
          <View
            style={[
              styles.pickerWrapper,
              Platform.OS === 'ios' && {
                height: 90,
                overflow: 'hidden',
                justifyContent: 'center',
              },
            ]}>
            <Picker
              style={[
                styles.dropDown,
                Platform.OS === 'ios' && {
                  height: 160, // Full scrollable height inside hidden wrapper
                  marginTop: -55, // Center 3rd row visually
                },
              ]}
              selectedValue={simpleVaccinationType}
              onValueChange={setSimpleVaccinationType}>
              {vaccinationTypeOptions.map(opt => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Vaccination Date</Text>
          <TouchableOpacity onPress={() => setShowDatePickerVaccination(true)}>
            <TextInput
              style={styles.input}
              value={
                simpleVaccinationDate instanceof Date
                  ? simpleVaccinationDate.toISOString().split('T')[0]
                  : ''
              }
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePickerVaccination && (
            <DateTimePicker
              value={
                simpleVaccinationDate instanceof Date
                  ? simpleVaccinationDate
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePickerVaccination(false);
                if (
                  selectedDate &&
                  selectedDate instanceof Date &&
                  !isNaN(selectedDate)
                ) {
                  setSimpleVaccinationDate(selectedDate);
                }
              }}
            />
          )}
          <Text style={styles.label}>Next Vaccination Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePickerNextVaccination(true)}>
            <TextInput
              style={styles.input}
              value={
                simpleNextVaccinationDate instanceof Date
                  ? simpleNextVaccinationDate.toISOString().split('T')[0]
                  : ''
              }
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePickerNextVaccination && (
            <DateTimePicker
              value={
                simpleNextVaccinationDate instanceof Date
                  ? simpleNextVaccinationDate
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePickerNextVaccination(false);
                if (
                  selectedDate &&
                  selectedDate instanceof Date &&
                  !isNaN(selectedDate)
                ) {
                  setSimpleNextVaccinationDate(selectedDate);
                }
              }}
            />
          )}
          {/* Additional vaccinations, same UI as main vaccination */}
          {vaccinations.length > 0 && (
            <View style={styles.additionalVaccinationList}>
              {vaccinations.map((v, idx) => (
                <View key={v._id || idx} style={{marginBottom: 10}}>
                  <Text style={styles.label}>Vaccination Type</Text>
                  <View
                    style={[
                      styles.pickerWrapper,
                      Platform.OS === 'ios' && {
                        height: 90,
                        overflow: 'hidden',
                        justifyContent: 'center',
                      },
                    ]}>
                    <Picker
                      style={[
                        styles.dropDown,
                        Platform.OS === 'ios' && {
                          height: 160, // Full scrollable height inside hidden wrapper
                          marginTop: -55, // Center 3rd row visually
                        },
                      ]}
                      selectedValue={v.vaccinationType}
                      onValueChange={val => {
                        setVaccinations(prev =>
                          prev.map((item, i) =>
                            i === idx ? {...item, vaccinationType: val} : item,
                          ),
                        );
                      }}>
                      {vaccinationTypeOptions.map(opt => (
                        <Picker.Item
                          key={opt.value}
                          label={opt.label}
                          value={opt.value}
                        />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.label}>Vaccination Date</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setVaccinations(prev =>
                        prev.map((item, i) =>
                          i === idx ? {...item, showDatePicker: true} : item,
                        ),
                      )
                    }>
                    <TextInput
                      style={styles.input}
                      value={
                        v.vaccinationDate instanceof Date &&
                        !isNaN(v.vaccinationDate)
                          ? v.vaccinationDate.toISOString().split('T')[0]
                          : typeof v.vaccinationDate === 'string' &&
                            v.vaccinationDate !== ''
                          ? v.vaccinationDate
                          : ''
                      }
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                  {v.showDatePicker && (
                    <DateTimePicker
                      value={
                        v.vaccinationDate instanceof Date
                          ? v.vaccinationDate
                          : new Date()
                      }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setVaccinations(prev =>
                          prev.map((item, i) =>
                            i === idx
                              ? {
                                  ...item,
                                  showDatePicker: false,
                                  vaccinationDate:
                                    selectedDate &&
                                    selectedDate instanceof Date &&
                                    !isNaN(selectedDate)
                                      ? selectedDate
                                      : item.vaccinationDate,
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  )}
                  <Text style={styles.label}>Next Vaccination Date</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setVaccinations(prev =>
                        prev.map((item, i) =>
                          i === idx
                            ? {...item, showNextDatePicker: true}
                            : item,
                        ),
                      )
                    }>
                    <TextInput
                      style={styles.input}
                      value={
                        v.nextVaccinationDate instanceof Date &&
                        !isNaN(v.nextVaccinationDate)
                          ? v.nextVaccinationDate.toISOString().split('T')[0]
                          : typeof v.nextVaccinationDate === 'string' &&
                            v.nextVaccinationDate !== ''
                          ? v.nextVaccinationDate
                          : ''
                      }
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                  {v.showNextDatePicker && (
                    <DateTimePicker
                      value={
                        v.nextVaccinationDate instanceof Date
                          ? v.nextVaccinationDate
                          : new Date()
                      }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setVaccinations(prev =>
                          prev.map((item, i) =>
                            i === idx
                              ? {
                                  ...item,
                                  showNextDatePicker: false,
                                  nextVaccinationDate:
                                    selectedDate &&
                                    selectedDate instanceof Date &&
                                    !isNaN(selectedDate)
                                      ? selectedDate
                                      : item.nextVaccinationDate,
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, styles.addMoreVaccinationButton]}
            onPress={() =>
              setVaccinations(prev => [...prev, createEmptyVaccination()])
            }>
            <Text style={styles.buttonText}>Add More Vaccination</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={updatePet}>
            <Text style={styles.buttonText}>Update Pet</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
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
      {renderForm()}
    </>
  );
};

// Helper for iOS date picker modal (calendar/spinner)
const IOSDatePickerModal = ({
  visible,
  value,
  onChange,
  onCancel,
  mode = 'date',
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onCancel}>
    <View style={styles.iosDatePickerModalOverlay}>
      <View style={styles.iosDatePickerModalContent}>
        <DateTimePicker
          value={value}
          mode={mode}
          display="spinner"
          onChange={onChange}
          style={{backgroundColor: '#fff'}}
        />
        <TouchableOpacity
          style={styles.iosDatePickerDoneButton}
          onPress={onCancel}>
          <Text style={styles.iosDatePickerDoneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFDFD',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  infoContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 0,
    marginTop: 0,
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
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
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
  pickerWrapper: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  dropDown: {
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  searchInput: {
    color: '#FB6A43',
  },
  iosPickerText: {
    color: '#333',
    fontSize: 16,
    paddingVertical: 10,
  },
  iosPickerPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  additionalVaccinationList: {
    marginBottom: 10,
  },
  additionalVaccinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  additionalVaccinationText: {
    flex: 1,
  },
  removeVaccinationText: {
    color: 'red',
    marginLeft: 10,
  },
  addMoreVaccinationButton: {
    marginBottom: 10,
    backgroundColor: '#4CAF50',
  },
  addVaccinationButton: {
    marginBottom: 0,
    backgroundColor: '#2196F3',
  },
  iosDatePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  iosDatePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  iosDatePickerDoneButton: {
    marginTop: 10,
    backgroundColor: '#FB6A43',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  iosDatePickerDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdatePetScreen;
