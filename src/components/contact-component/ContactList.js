// ContactList.js  
import React from 'react';
import { ScrollView, View } from 'react-native';
import ContactItem from './ContactItem';

const ContactList = ({ contacts, onPress, contentViewScroll }) => {
  return (
    <ScrollView onMomentumScrollEnd={contentViewScroll}>
      {contacts.map((contact, index) => (
        <ContactItem key={index} {...contact} onPress={onPress} />
      ))}
    </ScrollView>
  );
};

export default ContactList;