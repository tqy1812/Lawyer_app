// SearchBar.js  
import React from 'react';  
import { TextInput, View, StyleSheet } from 'react-native';  
  
const SearchBar = ({ onChangeText }) => {  
  return (  
    <View style={styles.container}>  
      <TextInput  
        style={styles.input}  
        placeholder="搜索联系人"  
        onChangeText={onChangeText}  
      />  
    </View>  
  );  
};  
  
const styles = StyleSheet.create({  
  container: {  
    padding: 10,  
    backgroundColor: '#fff',  
    borderBottomWidth: 1,  
    borderBottomColor: '#ddd',  
  },  
  input: {  
    height: 40,  
    backgroundColor: '#fff',  
    paddingHorizontal: 10,  
  },  
});  
  
export default SearchBar;