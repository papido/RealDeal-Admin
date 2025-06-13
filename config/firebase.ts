import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging"; // optional, if you need messaging

// Firebase native SDK uses google-services.json and GoogleService-Info.plist
// You don't need to manually initialize with a config object.

export { auth, firebase, firestore, messaging };
