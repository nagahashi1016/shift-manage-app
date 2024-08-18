import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './AdminLogin.css'; 

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const userDoc = await firestore.collection('users').doc(userCredential.user.uid).get();
      if (userDoc.exists && userDoc.data().isAdmin) {
        navigate('/admin-home');
      } else {
        alert('管理者権限がありません');
        auth.signOut();
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('ログインに失敗しました');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2 className="admin-login-title">管理者ログイン</h2>
        <form onSubmit={handleAdminLogin} className="admin-login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="admin-login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="admin-login-input"
          />
          <button type="submit" className="admin-login-button">ログイン</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
