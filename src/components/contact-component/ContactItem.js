// ContactItem.js  
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// const goDetails = (id) => {
//     console.log('goDetails', id);
//     // 'Chat', { id: 1, name:'zhangsan', avatar: ''}
// };

const ContactItem = ({ contact, onPress }) => {
    return (
        <TouchableOpacity style={[styles.item, contact.isFixed ? styles.fixed : '']} onPress={() => onPress(contact)}>
            <View style={styles.number}>
                <Image
                    style={styles.avatar}
                    source={{ uri: contact.avatar }}
                />
            </View>
            <View style={styles.name_box}>
                <View style={styles.name}>
                    <Text style={styles.name_text}>{contact.name}</Text>
                    <Text style={styles.info_text}>{contact.recentNews}</Text>
                </View>

                <Text style={styles.time}>{contact.date}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 0,
        paddingTop: 0
    },
    fixed: {
        backgroundColor: '#F4F4F5'
    },
    name_box: {
        fontSize: 16,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderStyle: 'solid', // 边框样式  
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        flex: 1,
    },
    name: {
        // fontSize: 16,
        // color: "#303133"
        marginLeft: 10,
    },
    name_text: {
        fontSize: 18,
        color: "#303133"
    },
    info_text: {
        fontSize: 14,
        color: "#B3B3B3",

    },
    time: {
        fontSize: 14,
        color: "#C0C4CC",
        marginRight: 15
    },
    number: {
        marginRight: 10,
        width: 40,
        height: 40,
        borderRadius: 5,
        borderWidth: 1, // 边框宽度  
        borderColor: '#000000', // 边框颜色  
        borderStyle: 'solid', // 边框样式  
        width: 40, // 视图宽度  
        height: 40, // 视图高度 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 5,
        overflow: 'hidden',
    },
});

export default ContactItem;