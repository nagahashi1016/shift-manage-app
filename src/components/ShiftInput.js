import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './ShiftInput.css';

const ShiftInput = () => {
  const [shifts, setShifts] = useState([]);
  const [salary, setSalary] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const [weekdayRate, setWeekdayRate] = useState(0);
  const [weekendRate, setWeekendRate] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsDoc = await firestore.collection('settings').doc('general').get();
      if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        setWeekdayRate(settings.weekdayRate);
        setWeekendRate(settings.weekendRate);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.uid);
      fetchShifts(user.uid);
      fetchUserName(user.uid);
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUserId(user.uid);
          fetchShifts(user.uid);
          fetchUserName(user.uid);
          sessionStorage.setItem('user', JSON.stringify(user));
        } else {
          navigate('/login');
        }
      });
      return () => unsubscribe();
    }
  }, [navigate]);

  const fetchShifts = async (uid) => {
    const shiftsRef = firestore.collection('shifts').where('userId', '==', uid);
    const shiftsSnapshot = await shiftsRef.get();
    const shiftsData = shiftsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: new Date(data.date + 'T00:00:00Z') 
      };
    });

    const nextMonth = new Date();
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    const daysInMonth = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0)).getUTCDate();
    const initialShifts = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), i));
      const shift = shiftsData.find(s => s.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]) || { date, start: '', end: '' };
      initialShifts.push(shift);
    }
    setShifts(initialShifts);
  };

  const fetchUserName = async (uid) => {
    const userRef = firestore.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      setUserName(userDoc.data().name);
    }
  };

  const handleShiftChange = (index, key, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][key] = value;
    setShifts(updatedShifts);
  };

  const calculateSalary = () => {
    let total = 0;
    shifts.forEach(shift => {
      if (shift.start && shift.end) {
        const startTime = new Date(`1970-01-01T${shift.start}:00Z`);
        const endTime = new Date(`1970-01-01T${shift.end}:00Z`);
        const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
        const isWeekend = shift.date.getUTCDay() === 0 || shift.date.getUTCDay() === 6;
        const hourlyRate = isWeekend ? weekendRate : weekdayRate;
        total += hoursWorked * hourlyRate;
      }
    });
    setSalary(total);
  };

  const saveShifts = async () => {
    if (!userId) return;

    const batch = firestore.batch();
    shifts.forEach(shift => {
      const shiftDate = shift.date.toISOString().split('T')[0];
      const shiftRef = firestore.collection('shifts').doc(`${userId}_${shiftDate}`);

      if (shift.start && shift.end) {
        batch.set(shiftRef, {
          date: shiftDate,
          start: shift.start,
          end: shift.end,
          userId: userId
        });
      } else {
        batch.delete(shiftRef); 
      }
    });
    await batch.commit();
    alert('シフトが保存されました');
    fetchShifts(userId); 
  };

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.removeItem('user'); 
    navigate('/login');
  };

  const formatDate = (date) => {
    const formatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    return formatter.format(date);
  };

  return (
    <div className="shift-input-container">
      <header className="shift-input-header">
        <span><strong>{userName}</strong> がログイン中</span>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      <h2>シフト入力画面</h2>
      <table className="shift-input-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>開始時間</th>
            <th>終了時間</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, index) => (
            <tr key={index}>
              <td>{formatDate(shift.date)}</td>
              <td>
                <input
                  type="time"
                  value={shift.start}
                  onChange={e => handleShiftChange(index, 'start', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={shift.end}
                  onChange={e => handleShiftChange(index, 'end', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="shift-actions">
        <button onClick={calculateSalary}>給与計算</button>
        <div>給与: {salary}円</div>
        <button onClick={saveShifts}>登録</button>
      </div>
    </div>
  );
};

export default ShiftInput;
