import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginModule from '../components/login'
import Button from '../components/button'
import firebase from 'firebase'

const LoginScreen = props => {
    const navigation = useNavigation();

  checkIfLoggedIn = () =>{
     firebase.auth().onAuthStateChanged(user => {
       if (user){
        navigation.navigate('TourCreation')
       } else {

       }
     })
  }

    return (
    <View style={styles.container}>
        <LoginModule />
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});


export default LoginScreen;