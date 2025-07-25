import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import RadioForm from 'react-native-simple-radio-button';
import MultiSelect from 'react-native-multiple-select';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const UpdatePetScreen = ({route}) => {
  const {pet} = route.params;
  const navigation = useNavigation();

  const [petType, setPetType] = useState(pet.petType || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(pet.name);
  const [dateOfBirth, setDateOfBirth] = useState(safeDate(pet.dateOfBirth));
  const [showDatePickerDOB, setShowDatePickerDOB] = useState(false);
  const [age] = useState(pet.age || '');
  const [gender, setGender] = useState(pet.gender);
  const [weight, setWeight] = useState(pet.weight);
  const [breed, setBreed] = useState(pet.breed);
  const [color, setColor] = useState(pet.color);
  const [petNo] = useState(pet.pet_no);
  const [hairCut, setHairCut] = useState(pet.hairCut || []);
  const [groomingType, setGroomingType] = useState(pet.groomingType || 'full');
  const [bathing, setBathing] = useState(pet.bathing);
  const [treatmentDone, setTreatmentDone] = useState(
    pet.treatmentDone || 'N/A',
  );
  const [lastTreatmentDate, setLastTreatmentDate] = useState(
    safeDate(pet.lastTreatmentDate),
  );
  const [showDatePickerLastTreatment, setShowDatePickerLastTreatment] =
    useState(false);
  const [nextTreatmentDate, setNextTreatmentDate] = useState(
    safeDate(pet.nextTreatmentDate),
  );
  const [showDatePickerNextTreatment, setShowDatePickerNextTreatment] =
    useState(false);
  const [vaccinationType, setVaccinationType] = useState(pet.vaccinationType);
  const [vaccinationDate, setVaccinationDate] = useState(
    safeDate(pet.vaccinationDate),
  );
  const [nextVaccinationDate, setNextVaccinationDate] = useState(
    safeDate(pet.nextVaccinationDate),
  );
  const [showDatePickerVaccination, setShowDatePickerVaccination] =
    useState(false);
  const [showDatePickerNextVaccination, setShowDatePickerNextVaccination] =
    useState(false);
  const [petImage, setPetImage] = useState(pet.petImage);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showVaccinationTypePicker, setShowVaccinationTypePicker] =
    useState(false);
  const [showBathingPicker, setShowBathingPicker] = useState(false);

  // Helper to safely parse date
  function safeDate(d) {
    if (!d) {
      return new Date();
    }
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

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
      formData.append('treatmentDone', treatmentDone);
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

      // Add vaccination type only if it's defined
      if (vaccinationType) {
        formData.append('vaccinationType', vaccinationType);
      }

      formData.append(
        'vaccinationDate',
        vaccinationDate instanceof Date && !isNaN(vaccinationDate)
          ? vaccinationDate.toISOString().split('T')[0]
          : '',
      );
      formData.append(
        'nextVaccinationDate',
        nextVaccinationDate instanceof Date && !isNaN(nextVaccinationDate)
          ? nextVaccinationDate.toISOString().split('T')[0]
          : '',
      );
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
        let errorMsg =
          data.error || 'Unable to update the pet. Please try again later.';
        if (errorMsg.toLowerCase().includes('not found')) {
          errorMsg = 'Pet not found.';
        } else if (errorMsg.toLowerCase().includes('missing')) {
          errorMsg = 'Please fill all required pet details.';
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while updating the pet. Please try again.',
      );
    }
  };

  const renderDatePicker = (visible, setVisible, date, setDate, title) => (
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
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
          />
        </View>
      </View>
    </Modal>
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
            <TouchableOpacity onPress={() => setVisible(false)}>
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
          <Text style={styles.mainTitle}>Update Pet</Text>

          {/* Personal Details */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <Text style={styles.label}>Pet Type</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <TextInput
                style={styles.input}
                value={petType}
                editable={false}
              />
            </TouchableOpacity>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePickerDOB(true)}>
              <Text style={styles.pickerButtonText}>
                {dateOfBirth.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {renderDatePicker(
              showDatePickerDOB,
              setShowDatePickerDOB,
              dateOfBirth,
              setDateOfBirth,
              'Select Date of Birth',
            )}

            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} value={age} editable={false} />

            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowGenderPicker(true)}>
              <Text style={styles.pickerButtonText}>
                {gender === 'M'
                  ? 'Male'
                  : gender === 'F'
                  ? 'Female'
                  : 'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {renderPickerModal(
              showGenderPicker,
              setShowGenderPicker,
              gender,
              setGender,
              [
                <Picker.Item key="male" label="Male" value="M" color="#333" />,
                <Picker.Item
                  key="female"
                  label="Female"
                  value="F"
                  color="#333"
                />,
              ],
              'Select Gender',
            )}

            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
            />
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
            />
            <Text style={styles.label}>Pet Number</Text>
            <TextInput style={styles.input} value={petNo} editable={false} />

            <Text style={styles.label}>Pet Image</Text>
            <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
              <Text style={styles.buttonText}>Select Pet Image</Text>
            </TouchableOpacity>
            {petImage && (
              <View style={styles.imageContainer}>
                <Image source={petImage} style={styles.image} />
              </View>
            )}
          </View>
          {/* Grooming Details */}
          <View style={styles.formSection}>
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
              searchInputStyle={styles.searchInputStyle}
              submitButtonColor="#FB6A43"
              submitButtonText="Submit"
            />
            <Text style={styles.label}>Grooming Type</Text>
            <RadioForm
              radio_props={[
                {label: 'Full', value: 'full'},
                {label: 'Bathing', value: 'bathing'},
              ]}
              initial={groomingType === 'full' ? 0 : 1}
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

                {renderPickerModal(
                  showBathingPicker,
                  setShowBathingPicker,
                  bathing,
                  setBathing,
                  [
                    <Picker.Item
                      key="anti tick bath"
                      label="Anti Tick Bath"
                      value="anti tick bath"
                      color="#333"
                    />,
                    <Picker.Item
                      key="medicated bath"
                      label="Medicated Bath"
                      value="medicated bath"
                      color="#333"
                    />,
                    <Picker.Item
                      key="routine bath"
                      label="Routine Bath"
                      value="routine bath"
                      color="#333"
                    />,
                  ],
                  'Select Bathing Type',
                )}
              </>
            )}
          </View>
          {/* Treatment Details */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Treatment Details</Text>
            <Text style={styles.label}>Treatment Done</Text>
            <RadioForm
              radio_props={[
                {label: 'Yes', value: 'Yes'},
                {label: 'No', value: 'No'},
              ]}
              initial={treatmentDone === 'Yes' ? 0 : 1}
              onPress={value => setTreatmentDone(value)}
              formHorizontal={true}
              labelHorizontal={true}
              buttonColor={'#FB6A43'}
              selectedButtonColor={'#FB6A43'}
              labelStyle={styles.radioLabel}
            />
            <Text style={styles.label}>Last Treatment Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePickerLastTreatment(true)}>
              <Text style={styles.pickerButtonText}>
                {lastTreatmentDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {renderDatePicker(
              showDatePickerLastTreatment,
              setShowDatePickerLastTreatment,
              lastTreatmentDate,
              setLastTreatmentDate,
              'Select Last Treatment Date',
            )}
            <Text style={styles.label}>Next Treatment Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePickerNextTreatment(true)}>
              <Text style={styles.pickerButtonText}>
                {nextTreatmentDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {renderDatePicker(
              showDatePickerNextTreatment,
              setShowDatePickerNextTreatment,
              nextTreatmentDate,
              setNextTreatmentDate,
              'Select Next Treatment Date',
            )}
          </View>
          {/* Vaccination Details */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Vaccination Details</Text>
            <Text style={styles.label}>Vaccination Type (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowVaccinationTypePicker(true)}>
              <Text style={styles.pickerButtonText}>
                {vaccinationType ? vaccinationType : 'Select Vaccination Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {renderPickerModal(
              showVaccinationTypePicker,
              setShowVaccinationTypePicker,
              vaccinationType,
              value => setVaccinationType(value),
              [
                <Picker.Item
                  key="none"
                  label="Select Vaccination Type"
                  value=""
                  color="#999"
                />,
                <Picker.Item
                  key="none2"
                  label="None"
                  value="None"
                  color="#333"
                />,
                <Picker.Item
                  key="vencosix"
                  label="Vencosix"
                  value="vencosix"
                  color="#333"
                />,
                <Picker.Item
                  key="vencomaxII"
                  label="Vencomax II"
                  value="vencomaxII"
                  color="#333"
                />,
                <Picker.Item
                  key="defenceBronch"
                  label="Defense Bronch"
                  value="DefenceBrouch"
                  color="#333"
                />,
                <Picker.Item key="arv" label="ARV" value="ARV" color="#333" />,
                <Picker.Item
                  key="ronvac"
                  label="Ronvac"
                  value="Ronvac"
                  color="#333"
                />,
              ],
              'Select Vaccination Type',
            )}
            <Text style={styles.label}>Vaccination Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePickerVaccination(true)}>
              <Text style={styles.pickerButtonText}>
                {vaccinationDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {renderDatePicker(
              showDatePickerVaccination,
              setShowDatePickerVaccination,
              vaccinationDate,
              setVaccinationDate,
              'Select Vaccination Date',
            )}
            <Text style={styles.label}>Next Vaccination Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePickerNextVaccination(true)}>
              <Text style={styles.pickerButtonText}>
                {nextVaccinationDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {renderDatePicker(
              showDatePickerNextVaccination,
              setShowDatePickerNextVaccination,
              nextVaccinationDate,
              setNextVaccinationDate,
              'Select Next Vaccination Date',
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={updatePet}>
              <Text style={styles.buttonText}>Update Pet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* All Modals */}
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
                <Ionicons name="dog" size={30} color="#FB6A43" />
                <Text style={styles.petTypeText}>Canine</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.petTypeButton}
                onPress={() => {
                  setPetType('Feline');
                  setModalVisible(false);
                }}>
                <Ionicons name="cat" size={30} color="#FB6A43" />
                <Text style={styles.petTypeText}>Feline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  input: {
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
  button: {
    backgroundColor: '#FB6A43',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: '#FB6A43',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
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
  iosPickerModal: {
    height: 200,
    width: '100%',
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
  searchInputStyle: {
    color: '#FB6A43',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  radioLabel: {
    fontSize: 14,
    marginRight: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  petTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  petTypeText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});

export default UpdatePetScreen;
