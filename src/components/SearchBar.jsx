import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';

const SearchBar = () => {
  return (
    <View>
      <View style={styles.searchBar}>
        <TextInput placeholder="Search" placeholderTextColor="#ccc" style={styles.searchInput} />
        <Ionicons name="search" size={25} color="#FB6A43" />
      </View>
    </View>
  )
}

export default SearchBar

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 3,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginBottom: 20,
      },
      searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 16,
        color: '#000',
      },
})