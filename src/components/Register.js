import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './Register.css';  

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('アルバイト');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const isAdmin = email === 'admin@example.com';
      await firestore.collection('users').doc(userCredential.user.uid).set({
        email: userCredential.user.email,
        name,
        userType,
        isAdmin,
      });
      navigate('/');
    } catch (error) {
      console.error('Error registering:', error);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="register-container">  
      <div className="register-box">  
        <h2 className="register-title">新規登録</h2> 
        <form onSubmit={handleRegister} className="register-form">  
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前"
            className="register-input"  
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="register-input" 
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="register-input"  
          />
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="register-select"  
          >
            <option value="アルバイト">アルバイト</option>
            <option value="正社員">正社員</option>
          </select>
          <button type="submit" className="register-button">登録</button>  
        </form>
      </div>
    </div>
  );
};

export default Register;
