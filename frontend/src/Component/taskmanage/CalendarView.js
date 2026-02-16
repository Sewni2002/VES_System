import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import API from '../../api';


/**
 * Session Calendar View
 *
 * - FullCalendar React component used to display scheduled sessions.
 * - dayGridPlugin provides month view of events.
 *
 * References:
 * [1] FullCalendar, “FullCalendar React Documentation,” https://fullcalendar.io/docs/react
 */


function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get('/api/scheduler/today'); 
      const evts = res.data.map(s => ({
        title: s.groupTopic + ' (' + s.groupId + ')',
        date: s.scheduledDateTime
      }));
      setEvents(evts);
    };
    fetch();
  }, []);

  return (
    <div>
      <h2 style={{fontSize:"1.5rem"}}>Session Calendar</h2>
      <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} />
    </div>
  );
}

export default CalendarView;
