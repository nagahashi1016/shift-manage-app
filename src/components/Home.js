import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './Home.css';

const Home = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      firestore.collection('users').doc(user.uid).get().then((userDoc) => {
        setUserName(userDoc.data().name);
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      sessionStorage.removeItem('user'); 
      navigate('/login');
    });
  };

  return (
    <div className="home">
      <header>
      <span> <strong>{userName}</strong> がログイン中 </span>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <h1>Home</h1>
      <div className="home-links">
        <Link to="/shift-input" className="home-link">シフト入力画面</Link>
        <Link to="/shift-result" className="home-link">シフト結果画面</Link>
      </div>
    </div>
  );
};

export default Home;
