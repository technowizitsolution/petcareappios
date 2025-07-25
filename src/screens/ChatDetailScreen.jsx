import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cohere API Key (Directly placed in the code, but should be secured in production)
const COHERE_API_KEY = 'JC9kHGuBQQYGwb037ocf2J3pTEP0gm8XknNV9ktd';

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTokenAndProceed = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('LoginScreen');
          return;
        }
        setLoading(false);
      } catch (error) {
        navigation.replace('LoginScreen');
      }
    };
    checkTokenAndProceed();
  }, []);

  // Function to get AI response from Cohere
  const askAI = async userMessage => {
    try {
      const response = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer JC9kHGuBQQYGwb037ocf2J3pTEP0gm8XknNV9ktd',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stream: false,
          model: 'command-r',
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
        }),
      });

      const body = await response.json();
      console.log('Cohere API Response:', body); // Debugging log

      // Extract text response correctly
      if (body.message && body.message.content) {
        if (Array.isArray(body.message.content)) {
          // Cohere sometimes returns an array, extract text from objects inside
          return body.message.content.map(item => item.text).join(' ');
        } else if (
          typeof body.message.content === 'object' &&
          body.message.content.text
        ) {
          return body.message.content.text;
        } else {
          return "Sorry, I couldn't process that request.";
        }
      } else {
        return "Sorry, I couldn't process that request.";
      }
    } catch (error) {
      console.error('AI Chatbot Error:', error.message);
      return 'Sorry, I am unable to respond at the moment.';
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (newMessage.trim()) {
      // Add user message to state
      const userMessageObj = {
        id: Date.now().toString(),
        sender: 'user',
        text: newMessage,
      };

      setMessages(prevMessages => [...prevMessages, userMessageObj]);

      const userMessage = newMessage;
      setNewMessage('');

      // Get AI Response
      const botReply = await askAI(userMessage);

      // Add AI response to state
      const botMessageObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai_bot',
        text: botReply,
      };

      setMessages(prevMessages => [...prevMessages, botMessageObj]);
    }
  };

  // Render chat messages
  const renderMessage = ({item}) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.sender : styles.receiver,
      ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  // Show loading while checking token
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={require('../assets/images/logopet1.png')}
            style={styles.userImage}
          />
          <Text style={styles.headerText}>Pet Care Team</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatList}
        inverted
        contentContainerStyle={{flexDirection: 'column-reverse'}}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about pet care..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  sender: {
    backgroundColor: '#ff9d5c',
    alignSelf: 'flex-end',
  },
  receiver: {
    backgroundColor: '#FB6A43',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    marginHorizontal: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FB6A43',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatDetailScreen;
