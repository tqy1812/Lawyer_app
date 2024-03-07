// ContactList.js  
import React from 'react';  
import { ScrollView, View } from 'react-native';  
import ContactItem from './ContactItem';  
  
const ContactList = ({ contacts }) => {  
  return (  
    <ScrollView>  
      {contacts.map((contact, index) => (  
        <ContactItem key={index} {...contact} />  
      ))}  
    </ScrollView>  
  );  
};  
  
export default ContactList;