import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import './AdminShiftResult.css';

const AdminShiftResult = () => {
  const [userName, setUserName] = useState('');
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [editableShifts, setEditableShifts] = useState({});
  const [savedShifts, setSavedShifts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        setUserName(userData.name);

        if (!userData.isAdmin) {
          alert('管理者権限がありません');
          navigate('/');
        } else {
          const shiftsSnapshot = await firestore.collectionGroup('shifts').get();
          const shiftsData = shiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setShifts(shiftsData);

          const usersSnapshot = await firestore.collection('users').get();
          const usersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          setUsers(usersData);
          setEditableShifts(formatShifts(shiftsData));
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

  const formatShifts = (shifts) => {
    const formattedShifts = {};
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const targetMonth = nextMonth.getMonth();
    const targetYear = nextMonth.getFullYear();

    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date + 'T00:00:00Z');
      if (shiftDate.getMonth() === targetMonth && shiftDate.getFullYear() === targetYear) {
        const date = shiftDate.toISOString().split('T')[0];
        if (!formattedShifts[date]) {
          formattedShifts[date] = {};
        }
        formattedShifts[date][shift.userId] = { start: shift.start, end: shift.end };
      }
    });

    return formattedShifts;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    const formatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    return formatter.format(date);
  };

  const handleInputChange = (date, userId, key, value) => {
    setEditableShifts((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [userId]: {
          ...prev[date][userId],
          [key]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    const newSavedShifts = {};
    for (const date in editableShifts) {
      for (const userId in editableShifts[date]) {
        const { start, end } = editableShifts[date][userId];
        await firestore.collection('finalShift').doc(`${date}_${userId}`).set({
          date,
          userId,
          start,
          end
        });
        if (!newSavedShifts[date]) {
          newSavedShifts[date] = {};
        }
        newSavedShifts[date][userId] = { start, end };
      }
    }
    setSavedShifts(newSavedShifts);
    alert('シフトが保存されました');
  };

  const handleSendToUsers = async () => {
    for (const date in editableShifts) {
      for (const userId in editableShifts[date]) {
        const { start, end } = editableShifts[date][userId];
        await firestore.collection('users').doc(userId).collection('finalShift').doc(date).set({
          date,
          start,
          end
        });
      }
    }
    alert('ユーザーにシフトが送信されました');
  };

  const isShiftChanged = (date, userId) => {
    return savedShifts[date]?.[userId]?.start !== editableShifts[date]?.[userId]?.start ||
           savedShifts[date]?.[userId]?.end !== editableShifts[date]?.[userId]?.end;
  };

  const formattedShifts = formatShifts(shifts);
  const sortedDates = Object.keys(formattedShifts).sort((a, b) => new Date(a) - new Date(b));

  const seishainUsers = users.filter(user => user.userType === '正社員');
  const arubaitoUsers = users.filter(user => user.userType === 'アルバイト');

  return (
    <div className="admin-shift-result">
      <header className="header">
        <span><strong>{userName}</strong> がログイン中</span>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      <h2>シフト結果画面</h2>
      <table className="shift-table">
        <thead>
          <tr>
            <th>日付</th>
            {seishainUsers.map((user, index) => (
              <th key={index}>{user.name}</th>
            ))}
            {arubaitoUsers.map((user, index) => (
              <th key={index}>{user.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date, index) => (
            <tr key={index}>
              <td>{formatDate(date)}</td>
              {seishainUsers.map((user, idx) => (
                <td key={idx}>{formattedShifts[date][user.uid] ? `${formattedShifts[date][user.uid].start} - ${formattedShifts[date][user.uid].end}` : 'なし'}</td>
              ))}
              {arubaitoUsers.map((user, idx) => (
                <td key={idx}>{formattedShifts[date][user.uid] ? `${formattedShifts[date][user.uid].start} - ${formattedShifts[date][user.uid].end}` : 'なし'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>シフト編集</h2>
      <table className="shift-table">
        <thead>
          <tr>
            <th>日付</th>
            {seishainUsers.map((user, index) => (
              <th key={index}>{user.name}</th>
            ))}
            {arubaitoUsers.map((user, index) => (
              <th key={index}>{user.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date, index) => (
            <tr key={index}>
              <td>{formatDate(date)}</td>
              {seishainUsers.map((user, idx) => (
                <td key={idx} className={isShiftChanged(date, user.uid) ? 'changed' : ''}>
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={editableShifts[date]?.[user.uid]?.start || ''}
                      onChange={(e) => handleInputChange(date, user.uid, 'start', e.target.value)}
                    />
                    <input
                      type="time"
                      value={editableShifts[date]?.[user.uid]?.end || ''}
                      onChange={(e) => handleInputChange(date, user.uid, 'end', e.target.value)}
                    />
                  </div>
                </td>
              ))}
              {arubaitoUsers.map((user, idx) => (
                <td key={idx} className={isShiftChanged(date, user.uid) ? 'changed' : ''}>
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={editableShifts[date]?.[user.uid]?.start || ''}
                      onChange={(e) => handleInputChange(date, user.uid, 'start', e.target.value)}
                    />
                    <input
                      type="time"
                      value={editableShifts[date]?.[user.uid]?.end || ''}
                      onChange={(e) => handleInputChange(date, user.uid, 'end', e.target.value)}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="buttons-container">
        <button className="save-button" onClick={handleSave}>保存</button>
        <button className="send-button" onClick={handleSendToUsers}>ユーザに送信</button>
      </div>
    </div>
  );
};

export default AdminShiftResult;
