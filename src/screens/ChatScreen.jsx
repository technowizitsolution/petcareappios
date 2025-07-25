import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchBar from '../components/SearchBar';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const chats = [
  {
    id: '1',
    name: 'Pet Care Team',
    message: "Of course, I'd be...",
    time: 'Today, 12:25',
    image: require('../assets/images/logopet1.png'), // Replace with your image
    unread: true,
  },
];

const ChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const renderChatItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate('ChatDetailScreen')}>
      <View style={styles.chatContent}>
        <Image source={item.image} style={styles.chatImage} />
        <View style={styles.chatText}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatMessage}>{item.message}</Text>
        </View>
      </View>
      <View style={styles.chatTimeContainer}>
        <Text style={styles.chatTime}>{item.time}</Text>
        {item.unread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.container}>
        {/* Search Bar */}
        <SearchBar />

        {/* Chats List */}
        <Text style={styles.sectionTitle}>Chats</Text>
        <FlatList
          data={chats.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatList}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatDetailScreen')}
          style={styles.fab}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 15,
    paddingBottom: 0, // Removed extra padding to eliminate space between ChatScreen and CustomTabBar
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FB6A43',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  chatList: {
    paddingBottom: 80,
  },
  chatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatText: {
    maxWidth: width * 0.6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatTimeContainer: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FB6A43',
    borderRadius: 5,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FB6A43',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default ChatScreen;
