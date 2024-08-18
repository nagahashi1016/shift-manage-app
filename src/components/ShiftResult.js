import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './ShiftResult.css';

const UserShiftResult = () => {
  const [userName, setUserName] = useState('');
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      firestore.collection('users').doc(user.uid).get().then((userDoc) => {
        setUserName(userDoc.data().name);
      });

      const fetchShiftsAndUsers = async () => {
        const shiftsSnapshot = await firestore.collection('finalShift').get();
        const shiftsData = shiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShifts(shiftsData);

        const usersSnapshot = await firestore.collection('users').get();
        const usersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setUsers(usersData);
      };

      fetchShiftsAndUsers();
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

  const formatShifts = (shifts) => {
    const formattedShifts = {};

    shifts.forEach(shift => {
      const date = shift.date.split('T')[0];
      if (!formattedShifts[date]) {
        formattedShifts[date] = {};
      }
      formattedShifts[date][shift.userId] = `${shift.start} - ${shift.end}`;
    });

    return formattedShifts;
  };

  const formattedShifts = formatShifts(shifts);

  return (
    <div className="user-shift-result">
      <header className="header">
        <span> <strong>{userName}</strong> がログイン中 </span>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <h2>シフト結果画面</h2>
      <table className="shift-table">
        <thead>
          <tr>
            <th>日付</th>
            {users.map((user, index) => (
              <th key={index}>{user.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(formattedShifts).map((date, index) => (
            <tr key={index}>
              <td>{new Date(date).toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              {users.map((user, idx) => (
                <td key={idx}>{formattedShifts[date][user.uid] || 'なし'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table><br></br>
    </div>
  );
};

export default UserShiftResult;
