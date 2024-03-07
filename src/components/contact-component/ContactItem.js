// ContactItem.js  
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContactItem = ({ name, number }) => {
    return (
        <View style={styles.item}>
            <View style={styles.number}>
                <Text>头像</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default ContactItem;