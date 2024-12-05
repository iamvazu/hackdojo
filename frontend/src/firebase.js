import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXeUth_l4m28Qrz-yo3Smn0LvrohId-jE",
  authDomain: "hackdojo-dev.firebaseapp.com",
  projectId: "hackdojo-dev",
  storageBucket: "hackdojo-dev.firebasestorage.app",
  messagingSenderId: "259254938241",
  appId: "1:259254938241:web:9ba4913677dc4fd588bb80",
  measurementId: "G-3Y7ZZT9GEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Only initialize analytics in production
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  const { getAnalytics } = require('firebase/analytics');
  analytics = getAnalytics(app);
}
export { analytics };
export default app;
