// SearchBar.js  
import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

const SearchBar = ({ onChangeText, onSubmitEditing }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="搜索联系人"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    marginTop: 15,
    marginLeft: 15
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingLeft: 10,
  },
});

export default SearchBar;