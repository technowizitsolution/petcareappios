import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const vaccinationOptions = {
  vencosix: 'Vencosix',
  vencomaxII: 'Vencomax II',
  ARV: 'ARV',
  DefenceBrouch: 'Defense Bronch',
  Ronvac: 'Ronvac',
  Other: 'Other',
};

const PetProfileScreen = ({route}) => {
  const navigation = useNavigation();
  const {pet} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [showBasicDetails, setShowBasicDetails] = useState(true);
  const [showGroomingDetails, setShowGroomingDetails] = useState(false);
  const [showVaccinationDetails, setShowVaccinationDetails] = useState(false);
  const [showTreatmentDetails, setShowTreatmentDetails] = useState(false);
  const [showSurgeryDetails, setShowSurgeryDetails] = useState(false);

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) {
      return 'N/A';
    }
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return 'N/A';
    }
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years}Y, ${months}M, ${days}D`;
  };

  const toggleSection = section => {
    setShowBasicDetails(false);
    setShowGroomingDetails(false);
    setShowVaccinationDetails(false);
    setShowTreatmentDetails(false);
    setShowSurgeryDetails(false);
    if (section === 'basic') {
      setShowBasicDetails(true);
    } else if (section === 'grooming') {
      setShowGroomingDetails(true);
    } else if (section === 'vaccination') {
      setShowVaccinationDetails(true);
    } else if (section === 'treatment') {
      setShowTreatmentDetails(true);
    } else if (section === 'surgery') {
      setShowSurgeryDetails(true);
    }
  };

  const deletePet = async () => {
    // Show confirmation alert
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete "${pet.name}"?\n\nThis action cannot be undone and will permanently remove:\n• Pet profile and all information\n• Pet image\n• All associated records`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              if (!token) {
                Alert.alert(
                  'Error',
                  'Authentication token not found. Please log in again.',
                );
                return;
              }

              const response = await fetch(`${URL}/pets/${pet._id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                Alert.alert(
                  'Success',
                  data.message || `${pet.name} has been deleted successfully.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                );
              } else {
                let errorMessage =
                  'Unable to delete the pet. Please try again later.';

                try {
                  const errorData = await response.json();
                  errorMessage =
                    errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                  // If response is not JSON, use status text
                  if (response.status === 404) {
                    errorMessage =
                      'Pet not found. It may have already been deleted.';
                  } else if (response.status === 401) {
                    errorMessage = 'You are not authorized to delete this pet.';
                  } else if (response.status === 403) {
                    errorMessage = 'Access denied. You cannot delete this pet.';
                  } else if (response.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                  }
                }

                Alert.alert('Error', errorMessage);
              }
            } catch (error) {
              console.error('Error deleting pet:', error);

              if (error.message.includes('Network')) {
                Alert.alert(
                  'Network Error',
                  'Please check your internet connection and try again.',
                );
              } else if (error.message.includes('timeout')) {
                Alert.alert(
                  'Connection Timeout',
                  'The request took too long. Please try again.',
                );
              } else {
                Alert.alert(
                  'Error',
                  'An unexpected error occurred while deleting the pet. Please try again.',
                );
              }
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Capitalize helper
  function capitalizeWords(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }
    return str.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{flex: 1, backgroundColor: '#FDFDFD'}}>
      <ScrollView style={styles.container}>
        <ImageBackground
          source={{uri: pet.petImage}} // Use the URL from the data
          style={styles.serviceImage}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Ionicons name="arrow-undo" size={20} color="#0F0F0F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setModalVisible(true)}>
              <Entypo name="dots-three-vertical" size={20} color="#0F0F0F" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      navigation.navigate('UpdatePetScreen', {pet});
                    }}>
                    <Text style={styles.modalButtonText}>
                      Update Pet Profile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      deletePet();
                    }}>
                    <Text style={styles.modalButtonText}>Delete Pet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ImageBackground>

        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.petName}>{capitalizeWords(pet.name)}</Text>
            <Text style={styles.petBreed}>{capitalizeWords(pet.breed)}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pet</Text>
              <Icon
                name={pet.petType === 'Canine' ? 'dog' : 'cat'}
                size={24}
                color="#FB6A43"
              />
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>
                {pet.weight ? `${pet.weight} kg` : 'N/A'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Gender</Text>
              <Icon
                name={pet.gender === 'M' ? 'gender-male' : 'gender-female'}
                size={24}
                color="#FB6A43"
              />
            </View>
          </View>

          {/* Basic Details */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('basic')}>
            <Text style={styles.sectionHeaderText}>Personal Details</Text>
            <Ionicons
              name={showBasicDetails ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {showBasicDetails && (
            <View style={styles.additionalInfo}>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <Ionicons name="calendar-outline" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Age</Text>
                  <Text style={styles.statValue}>
                    {calculateAge(pet.dateOfBirth)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <Ionicons
                    name="color-palette-outline"
                    size={35}
                    color="#FB6A43"
                  />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Color</Text>
                  <Text style={styles.InfoValue}>
                    {capitalizeWords(pet.color) || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <Ionicons
                    name="pricetags-outline"
                    size={32}
                    color="#FB6A43"
                  />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Pet Card Number</Text>
                  <Text style={styles.InfoValue}>
                    {capitalizeWords(pet.pet_no) || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Grooming Details */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('grooming')}>
            <Text style={styles.sectionHeaderText}>Grooming Details</Text>
            <Ionicons
              name={showGroomingDetails ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {showGroomingDetails && (
            <View style={styles.additionalInfo}>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <Entypo name="scissors" size={32} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Hair Cut</Text>
                  <Text style={styles.InfoValue}>
                    {pet.hairCut && pet.hairCut.length > 0
                      ? pet.hairCut.map(capitalizeWords).join(', ')
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <Ionicons name="water" size={32} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Grooming Type</Text>
                  <Text style={styles.InfoValue}>
                    {capitalizeWords(pet.groomingType) || 'N/A'}
                  </Text>
                </View>
              </View>
              {/* Bathing (array) */}
              {Array.isArray(pet.bathing) && pet.bathing.length > 0 && (
                <View style={styles.row}>
                  <View style={styles.InfoIcon}>
                    <FontAwesome5 name="bath" size={32} color="#FB6A43" />
                  </View>
                  <View style={styles.InfoState}>
                    <Text style={styles.InfoLabel}>Bathing Types</Text>
                    <Text style={styles.InfoValue}>
                      {pet.bathing.map(capitalizeWords).join(', ')}
                    </Text>
                  </View>
                </View>
              )}
              {/* Legacy Bathing (string) */}
              {pet.groomingType === 'bathing' &&
                (!Array.isArray(pet.bathing) || pet.bathing.length === 0) && (
                  <View style={styles.row}>
                    <View style={styles.InfoIcon}>
                      <FontAwesome5 name="bath" size={32} color="#FB6A43" />
                    </View>
                    <View style={styles.InfoState}>
                      <Text style={styles.InfoLabel}>Bathing</Text>
                      <Text style={styles.InfoValue}>
                        {capitalizeWords(pet.bathing) || 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          )}

          {/* Treatment Details */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('treatment')}>
            <Text style={styles.sectionHeaderText}>Treatment Details</Text>
            <Ionicons
              name={showTreatmentDetails ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {showTreatmentDetails && (
            <View style={styles.additionalInfo}>
              {/* Legacy/Single-value fields */}
              {pet.treatmentType && pet.treatmentType.trim() !== '' ? (
                <View style={styles.row}>
                  <View style={styles.InfoIcon}>
                    <MaterialIcons name="healing" size={35} color="#FB6A43" />
                  </View>
                  <View style={styles.InfoState}>
                    <Text style={styles.InfoLabel}>Treatment Type</Text>
                    <Text style={styles.InfoValue}>
                      {capitalizeWords(pet.treatmentType)}
                    </Text>
                  </View>
                </View>
              ) : null}
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="done-all" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Treatment Date</Text>
                  <Text style={styles.InfoValue}>
                    {pet.treatmentDate && pet.treatmentDate.trim() !== ''
                      ? pet.treatmentDate
                      : pet.lastTreatmentDate &&
                        pet.lastTreatmentDate.trim() !== ''
                      ? pet.lastTreatmentDate
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="schedule" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Next Treatment Date</Text>
                  <Text style={styles.InfoValue}>
                    {pet.nextTreatmentDate &&
                    pet.nextTreatmentDate.trim() !== ''
                      ? pet.nextTreatmentDate
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="description" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Prescription</Text>
                  <Text style={styles.InfoValue}>
                    {pet.treatmentPrescription &&
                    pet.treatmentPrescription.trim() !== ''
                      ? pet.treatmentPrescription
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              {/* Array records */}
              {Array.isArray(pet.treatments) && pet.treatments.length > 0
                ? pet.treatments.map((t, idx) => (
                    <React.Fragment key={t._id || idx}>
                      {t.treatmentType && t.treatmentType.trim() !== '' ? (
                        <View style={styles.row}>
                          <View style={styles.InfoIcon}>
                            <MaterialIcons
                              name="healing"
                              size={35}
                              color="#FB6A43"
                            />
                          </View>
                          <View style={styles.InfoState}>
                            <Text style={styles.InfoLabel}>Treatment Type</Text>
                            <Text style={styles.InfoValue}>
                              {capitalizeWords(t.treatmentType)}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="done-all"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Treatment Date</Text>
                          <Text style={styles.InfoValue}>
                            {t.treatmentDate || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="schedule"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>
                            Next Treatment Date
                          </Text>
                          <Text style={styles.InfoValue}>
                            {t.nextTreatmentDate || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="description"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Prescription</Text>
                          <Text style={styles.InfoValue}>
                            {t.prescription || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      {t.notes ? (
                        <View style={styles.row}>
                          <View style={styles.InfoIcon}>
                            <MaterialIcons
                              name="notes"
                              size={35}
                              color="#FB6A43"
                            />
                          </View>
                          <View style={styles.InfoState}>
                            <Text style={styles.InfoLabel}>Notes</Text>
                            <Text style={styles.InfoValue}>{t.notes}</Text>
                          </View>
                        </View>
                      ) : null}
                    </React.Fragment>
                  ))
                : (!pet.treatmentType || pet.treatmentType.trim() === '') &&
                  (!pet.treatmentDate || pet.treatmentDate.trim() === '') &&
                  (!pet.lastTreatmentDate ||
                    pet.lastTreatmentDate.trim() === '') &&
                  (!pet.treatmentPrescription ||
                    pet.treatmentPrescription.trim() === '')
                ? null
                : null}
            </View>
          )}

          {/* Surgery Details */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('surgery')}>
            <Text style={styles.sectionHeaderText}>Surgery Details</Text>
            <Ionicons
              name={showSurgeryDetails ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {showSurgeryDetails && (
            <View style={styles.additionalInfo}>
              {/* Legacy/Single-value fields */}
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons
                    name="local-hospital"
                    size={35}
                    color="#FB6A43"
                  />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Surgery Type</Text>
                  <Text style={styles.InfoValue}>
                    {pet.surgeryType && pet.surgeryType.trim() !== ''
                      ? capitalizeWords(pet.surgeryType)
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="done-all" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Surgery Date</Text>
                  <Text style={styles.InfoValue}>
                    {pet.surgeryDate && pet.surgeryDate.trim() !== ''
                      ? pet.surgeryDate
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="description" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Prescription</Text>
                  <Text style={styles.InfoValue}>
                    {pet.surgeryPrescription &&
                    pet.surgeryPrescription.trim() !== ''
                      ? pet.surgeryPrescription
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              {/* Array records */}
              {Array.isArray(pet.surgeries) && pet.surgeries.length > 0
                ? pet.surgeries.map((s, idx) => (
                    <React.Fragment key={s._id || idx}>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="local-hospital"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Surgery Type</Text>
                          <Text style={styles.InfoValue}>
                            {capitalizeWords(s.surgeryType || 'N/A')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="done-all"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Surgery Date</Text>
                          <Text style={styles.InfoValue}>
                            {s.surgeryDate || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="description"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Prescription</Text>
                          <Text style={styles.InfoValue}>
                            {s.prescription || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      {s.notes ? (
                        <View style={styles.row}>
                          <View style={styles.InfoIcon}>
                            <MaterialIcons
                              name="notes"
                              size={35}
                              color="#FB6A43"
                            />
                          </View>
                          <View style={styles.InfoState}>
                            <Text style={styles.InfoLabel}>Notes</Text>
                            <Text style={styles.InfoValue}>{s.notes}</Text>
                          </View>
                        </View>
                      ) : null}
                    </React.Fragment>
                  ))
                : (!pet.surgeryType || pet.surgeryType.trim() === '') &&
                  (!pet.surgeryDate || pet.surgeryDate.trim() === '') &&
                  (!pet.surgeryPrescription ||
                    pet.surgeryPrescription.trim() === '')
                ? null
                : null}
            </View>
          )}

          {/* Vaccination Details */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('vaccination')}>
            <Text style={styles.sectionHeaderText}>Vaccination Details</Text>
            <Ionicons
              name={showVaccinationDetails ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {showVaccinationDetails && (
            <View style={styles.additionalInfo}>
              {/* Legacy/Single-value fields */}
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="vaccines" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Vaccination Type</Text>
                  <Text style={styles.InfoValue}>
                    {pet.vaccinationType && pet.vaccinationType.trim() !== ''
                      ? vaccinationOptions[pet.vaccinationType] ||
                        pet.vaccinationType
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="done-all" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Vaccination Date</Text>
                  <Text style={styles.InfoValue}>
                    {pet.vaccinationDate && pet.vaccinationDate.trim() !== ''
                      ? pet.vaccinationDate
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="schedule" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Next Vaccination Date</Text>
                  <Text style={styles.InfoValue}>
                    {pet.nextVaccinationDate &&
                    pet.nextVaccinationDate.trim() !== ''
                      ? pet.nextVaccinationDate
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <MaterialIcons name="notes" size={35} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Notes</Text>
                  <Text style={styles.InfoValue}>
                    {pet.vaccinationNotes && pet.vaccinationNotes.trim() !== ''
                      ? pet.vaccinationNotes
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              {/* Array records */}
              {Array.isArray(pet.vaccinations) && pet.vaccinations.length > 0
                ? pet.vaccinations.map((v, idx) => (
                    <React.Fragment key={v._id || idx}>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="vaccines"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Vaccination Type</Text>
                          <Text style={styles.InfoValue}>
                            {vaccinationOptions[v.vaccinationType] ||
                              v.vaccinationType ||
                              'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="done-all"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>Vaccination Date</Text>
                          <Text style={styles.InfoValue}>
                            {v.vaccinationDate
                              ? typeof v.vaccinationDate === 'string'
                                ? v.vaccinationDate
                                : v.vaccinationDate instanceof Date
                                ? v.vaccinationDate.toISOString().split('T')[0]
                                : 'N/A'
                              : 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.InfoIcon}>
                          <MaterialIcons
                            name="schedule"
                            size={35}
                            color="#FB6A43"
                          />
                        </View>
                        <View style={styles.InfoState}>
                          <Text style={styles.InfoLabel}>
                            Next Vaccination Date
                          </Text>
                          <Text style={styles.InfoValue}>
                            {v.nextVaccinationDate
                              ? typeof v.nextVaccinationDate === 'string'
                                ? v.nextVaccinationDate
                                : v.nextVaccinationDate instanceof Date
                                ? v.nextVaccinationDate
                                    .toISOString()
                                    .split('T')[0]
                                : 'N/A'
                              : 'N/A'}
                          </Text>
                        </View>
                      </View>
                      {v.notes ? (
                        <View style={styles.row}>
                          <View style={styles.InfoIcon}>
                            <MaterialIcons
                              name="notes"
                              size={35}
                              color="#FB6A43"
                            />
                          </View>
                          <View style={styles.InfoState}>
                            <Text style={styles.InfoLabel}>Notes</Text>
                            <Text style={styles.InfoValue}>{v.notes}</Text>
                          </View>
                        </View>
                      ) : null}
                    </React.Fragment>
                  ))
                : (!pet.vaccinationType || pet.vaccinationType.trim() === '') &&
                  (!pet.vaccinationDate || pet.vaccinationDate.trim() === '') &&
                  (!pet.nextVaccinationDate ||
                    pet.nextVaccinationDate.trim() === '') &&
                  (!pet.vaccinationNotes || pet.vaccinationNotes.trim() === '')
                ? null
                : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 50,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 50,
  },
  arrow: {
    fontSize: 18,
  },
  dots: {
    fontSize: 18,
  },
  serviceImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    paddingTop: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -30,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  petBreed: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 25,
  },
  statBox: {
    alignItems: 'center',
    borderRadius: 10,
    borderColor: '#FB6A43',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    width: '30%',
    marginHorizontal: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FB6A43',
    borderRadius: 10,
    marginTop: 10,
    zIndex: 1,
  },
  sectionHeaderText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  additionalInfo: {
    marginTop: -15,
    backgroundColor: '#fffffe',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    elevation: 3,
    zIndex: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  InfoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  InfoState: {
    marginLeft: 20,
  },
  InfoLabel: {
    fontSize: 16,
    color: '#888',
    paddingBottom: 2,
  },
  InfoValue: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    width: '70%',
    height: 50,
    backgroundColor: '#FB6A43',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 60,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: '#FB6A43',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PetProfileScreen;
