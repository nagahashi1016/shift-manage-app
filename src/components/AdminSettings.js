import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import './AdminSetting.css';

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [weekdayRate, setWeekdayRate] = useState(1000);
  const [weekendRate, setWeekendRate] = useState(1200);

  useEffect(() => {
    const fetchUsersAndSettings = async () => {
      const usersSnapshot = await firestore.collection('users').get();
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const settingsDoc = await firestore.collection('settings').doc('general').get();
      if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        setWeekdayRate(settings.weekdayRate);
        setWeekendRate(settings.weekendRate);
      }
    };

    fetchUsersAndSettings();
  }, []);

  const handleDeleteUser = async (userId) => {
    await firestore.collection('users').doc(userId).delete();
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleUpdateSettings = async () => {
    await firestore.collection('settings').doc('general').set({
      weekdayRate,
      weekendRate
    });
    alert('設定が更新されました');
  };

  return (
    <div className="admin-settings">
      <h2 className="settings-title">設定画面</h2>
      <div className="user-management">
        <h3 className="section-title">ユーザ管理</h3>
        <ul className="user-list">
          {users.map(user => (
            <li key={user.id} className="user-item">
              <span>{user.name} - {user.userType}</span>
              <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="salary-settings">
        <h3 className="section-title">給料設定</h3>
        <label className="salary-label">
          平日時給:
          <input
            type="number"
            value={weekdayRate}
            onChange={e => setWeekdayRate(Number(e.target.value))}
            className="salary-input"
          />
        </label>
        <label className="salary-label">
          休日時給:
          <input
            type="number"
            value={weekendRate}
            onChange={e => setWeekendRate(Number(e.target.value))}
            className="salary-input"
          />
        </label>
        <button className="update-button" onClick={handleUpdateSettings}>更新</button>
      </div>
    </div>
  );
};

export default AdminSettings;
