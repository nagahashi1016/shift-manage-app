import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './AdminHome.css';

const AdminHome = () => {
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        setUserName(userData.name);
        setIsAdmin(userData.isAdmin);

        if (!userData.isAdmin) {
          alert('管理者権限がありません');
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  if (!isAdmin) {
    return null; 
  }

  return (
    <div className="admin-home">
      <header className="admin-home-header">
        <span> <strong>管理者: {userName}</strong> がログイン中 </span>
        <button className="admin-home-logout" onClick={handleLogout}>Logout</button>
      </header>
      <h1 className="admin-home-title">管理者ホーム</h1>
      <div className="admin-home-links">
        <Link to="/admin-shift-result" className="admin-home-link">シフト結果画面</Link>
        <Link to="/admin-settings" className="admin-home-link">設定画面</Link>
      </div>
    </div>
  );
};

export default AdminHome;
