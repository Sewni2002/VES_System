import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('/api/scheduler/notifications');
      setNotifs(res.data);
    };
    fetch();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifs.map(n => (
          <li key={n._id}>{n.message} ({n.type})</li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
