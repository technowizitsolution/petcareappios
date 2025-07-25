import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
//import auth from '@react-native-firebase/auth';

const URL = 'https://petcare-1c443.el.r.appspot.com';

const ProfileScreen = props => {
  const navigation = useNavigation();
  const [data, setData] = useState({}); // Initialize as an empty object
  const [petData, setPetData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dummyImage =
    'https://res.cloudinary.com/dyhltvzmi/image/upload/v1738928372/freepik__the-style-is-candid-image-photography-with-natural__21450_nfpfio.jpg';

  const logout = async props => {
    try {
      // Remove AsyncStorage tokens first
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('firebaseToken');

      // Check if there's a current user before signing out
      //const currentUser = auth().currentUser;
      //if (currentUser) {
      //  await auth().signOut();
      //}

      // Reset navigation stack completely
      props.navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    } catch (error) {
      console.log('Error during logout:', error);
      // Continue with navigation reset even if there's an error
      props.navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  const getUserAPIData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // const url = 'https://petcare-1c443.el.r.appspot.com/profile';
      const url = `${URL}/profile`;
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.statusText} - ${errorText}`,
        );
      }
      let data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getPetAPIData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // const url = 'https://petcare-1c443.el.r.appspot.com/pets';
      const url = `${URL}/pets`;
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      let petdata = await response.json();
      setPetData(petdata);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserAPIData();
    getPetAPIData().then(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUserAPIData();
      getPetAPIData();
    }, []),
  );

  useEffect(() => {
    getUserAPIData();
    getPetAPIData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <ImageBackground
        source={{uri: data.userImage || dummyImage}} // Use the dummy image if userImage is not available
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
                    navigation.navigate('UpdateUserProfileScreen', {data});
                  }}>
                  <Text style={styles.modalButtonText}>
                    Update User Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    navigation.navigate('DeleteAccountScreen');
                  }}>
                  <Text
                    style={[styles.modalButtonText, styles.deleteButtonText]}>
                    Delete Account
                  </Text>
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

      {/* {data.userImage ? (
        <ImageBackground
          source={{ uri: data.userImage }} // Use the URL from the data
          style={styles.serviceImage}
        />
      ) : (
        <View style={styles.serviceImagePlaceholder} />
      )} */}
      {data.name ? (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.Name}>{data.name}</Text>
            <Text style={styles.Email}>{data.address}</Text>
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <View style={styles.servicesContainer}>
        {petData.length > 0
          ? petData.map((pet, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate('PetProfileScreen', {pet})}
                style={styles.serviceCard}>
                <Image
                  source={{uri: pet.petImage}} // Use the URL from the data
                  style={styles.petImage}
                />
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>
            ))
          : null}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddPetScreen')}
          style={styles.serviceCard}>
          <View style={styles.addPetButton}>
            <Ionicons name="add" size={50} color="#fff" />
            <Text style={styles.addPetButtonText}>Add Pet</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => logout(props)}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
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
    height: 320,
    resizeMode: 'cover',
    paddingTop: 20,
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 350,
    backgroundColor: '#ccc',
    paddingTop: 20,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: -30,
  },
  Name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  Email: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  serviceCard: {
    width: '45%',
    backgroundColor: '#FB6A43',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    elevation: 3,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  addPetButton: {
    alignItems: 'center',
  },
  addPetButtonText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
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
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  deleteButtonText: {
    color: '#fff',
  },
});

export default ProfileScreen;
