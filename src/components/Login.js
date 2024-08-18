import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      sessionStorage.setItem('user', JSON.stringify({ uid: user.uid, email: user.email }));
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('ログインに失敗しました');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <button onClick={() => navigate('/admin-login')} className="admin-button">管理者ログイン</button>
      </div>
      <div className="login-box">
        <h2 className="login-title">ログイン</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="login-input"
          />
          <button type="submit" className="login-button">ログイン</button>
        </form>
        <button onClick={() => navigate('/register')} className="login-button">新規登録</button>
      </div>
    </div>
  );
};

export default Login;
