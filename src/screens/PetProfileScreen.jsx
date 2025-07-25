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
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const vaccinationOptions = {
  vencosix: 'Vencosix',
  vencomaxII: 'Vencomax II',
  ARV: 'ARV',
  DefenceBrouch: 'Defense Bronch',
};

const PetProfileScreen = ({route}) => {
  const navigation = useNavigation();
  const {pet} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [showBasicDetails, setShowBasicDetails] = useState(true);
  const [showGroomingDetails, setShowGroomingDetails] = useState(false);
  const [showVaccinationDetails, setShowVaccinationDetails] = useState(false);

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
    if (section === 'basic') {
      setShowBasicDetails(true);
      setShowGroomingDetails(false);
      setShowVaccinationDetails(false);
    } else if (section === 'grooming') {
      setShowBasicDetails(false);
      setShowGroomingDetails(true);
      setShowVaccinationDetails(false);
    } else if (section === 'vaccination') {
      setShowBasicDetails(false);
      setShowGroomingDetails(false);
      setShowVaccinationDetails(true);
    }
  };

  const deletePet = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${URL}/pets/${pet._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Pet deleted successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        const errorText = await response.text();
        throw new Error(
          `Error deleting pet: ${response.statusText} - ${errorText}`,
        );
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      if (error.message.includes('Error deleting pet')) {
        Alert.alert(
          'Error',
          'Unable to delete the pet. Please try again later.',
        );
      } else {
        Alert.alert(
          'Error',
          'An unexpected error occurred while deleting the pet. Please try again.',
        );
      }
    }
  };

  return (
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
                  <Text style={styles.modalButtonText}>Update Pet Profile</Text>
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
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
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
                <Text style={styles.InfoValue}>{pet.color || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.InfoIcon}>
                <Ionicons name="pricetags-outline" size={32} color="#FB6A43" />
              </View>
              <View style={styles.InfoState}>
                <Text style={styles.InfoLabel}>Pet Card Number</Text>
                <Text style={styles.InfoValue}>{pet.pet_no || 'N/A'}</Text>
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
                  {pet.hairCut?.join(', ') || 'N/A'}
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
                  {pet.groomingType || 'N/A'}
                </Text>
              </View>
            </View>
            {pet.groomingType === 'bathing' && (
              <View style={styles.row}>
                <View style={styles.InfoIcon}>
                  <FontAwesome6 name="bath" size={32} color="#FB6A43" />
                </View>
                <View style={styles.InfoState}>
                  <Text style={styles.InfoLabel}>Bathing</Text>
                  <Text style={styles.InfoValue}>{pet.bathing || 'N/A'}</Text>
                </View>
              </View>
            )}
            <View style={styles.row}>
              <View style={styles.InfoIcon}>
                <FontAwesome6 name="user-doctor" size={32} color="#FB6A43" />
              </View>
              <View style={styles.InfoState}>
                <Text style={styles.InfoLabel}>Treatment Done</Text>
                <Text style={styles.InfoValue}>
                  {pet.treatmentDone || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.InfoIcon}>
                <MaterialIcons name="done-all" size={35} color="#FB6A43" />
              </View>
              <View style={styles.InfoState}>
                <Text style={styles.InfoLabel}>Last Treatment Date</Text>
                <Text style={styles.InfoValue}>
                  {pet.lastTreatmentDate || 'N/A'}
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
                  {pet.nextTreatmentDate || 'N/A'}
                </Text>
              </View>
            </View>
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
            <View style={styles.row}>
              <View style={styles.InfoIcon}>
                <MaterialIcons name="vaccines" size={35} color="#FB6A43" />
              </View>
              <View style={styles.InfoState}>
                <Text style={styles.InfoLabel}>Vaccination Type</Text>
                <Text style={styles.InfoValue}>
                  {vaccinationOptions[pet.vaccinationType] || 'N/A'}
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
                  {pet.vaccinationDate || 'N/A'}
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
                  {pet.nextVaccinationDate || 'N/A'}
                </Text>
              </View>
            </View>
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
