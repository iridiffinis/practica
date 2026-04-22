import React, { useState, useRef, useLayoutEffect } from 'react';
import './BookingPage.css';

const BookingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [selectedDayObj, setSelectedDayObj] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Stări pentru Formular și Validare
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', specialRequests: ''
  });
  const [errors, setErrors] = useState({});

  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0, arrowOffset: 0 });
  const bubbleRef = useRef(null);
  const calendarWrapperRef = useRef(null);

  const zileSaptamana = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
  const luniAn = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useLayoutEffect(() => {
    if (selectedDayObj && selectedDayObj.elementRef && bubbleRef.current && calendarWrapperRef.current) {
      const dayRect = selectedDayObj.elementRef.getBoundingClientRect();
      const calendarRect = calendarWrapperRef.current.getBoundingClientRect();
      const bubbleRect = bubbleRef.current.getBoundingClientRect();

      let bubbleLeft = (dayRect.left + dayRect.width / 2) - calendarRect.left;
      const padding = 15;
      const minLeft = padding + bubbleRect.width / 2;
      const maxLeft = calendarRect.width - padding - bubbleRect.width / 2;
      bubbleLeft = Math.max(minLeft, Math.min(maxLeft, bubbleLeft));

      const actualCenter = (dayRect.left + dayRect.width / 2) - calendarRect.left;
      const arrowOffset = actualCenter - bubbleLeft;

      setBubblePosition({
        top: dayRect.bottom - calendarRect.top,
        left: bubbleLeft,
        arrowOffset: arrowOffset
      });
    }
  }, [selectedDayObj, currentStep, errors]);

  const handleDateClick = (day, element) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = dateToCheck.getDay();
    if (![5, 6, 0].includes(dayOfWeek)) return;

    setSelectedDayObj({ day, elementRef: element });
    setCurrentStep('slots');
    setAvailableSlots([
      { id: 1, time: '10:00 am - 1:00 pm', availableSpaces: 1 },
      { id: 2, time: '2:00 pm - 5:00 pm', availableSpaces: 2 },
      { id: 3, time: '6:00 pm - 9:00 pm', availableSpaces: 1 },
    ]);
  };

  // --- LOGICA DE VALIDARE ---
  const validate = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prenumele este obligatoriu';
    if (!formData.lastName.trim()) newErrors.lastName = 'Numele este obligatoriu';
    
    // Validare Email (Regex standard)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email invalid';
    }

    // Validare Telefon (Cifre și lungime de 10)
    const phoneRegex = /^[0-9]+$/;
    if (!formData.phone) {
      newErrors.phone = 'Telefonul este obligatoriu';
    } else if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
      newErrors.phone = 'Introduceți un număr valid (min. 10 cifre)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Ștergem eroarea pe măsură ce utilizatorul scrie
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setCurrentStep('success');
    }
  };

  const handleCloseBubble = () => {
    setSelectedDayObj(null);
    setErrors({});
  };

  return (
    <div className="booking-page">
      <nav className="top-navigation">
        <div className="logo-section">
          <h2>Minitopia</h2>
          <small>- Playground -</small>
        </div>
        <ul className="nav-links">
          <li>Acasă</li>
          <li>Activități</li>
          <li>Prețuri</li>
          <li>Contact</li>
          <li className="active">Rezervă Vizita</li>
        </ul>
      </nav>

      <main className="booking-content">
        <div className="booking-header">
          <h1>Alege data petrecerii</h1>
          <p>Rezervă simplu și rapid intervalul dorit.</p>
        </div>

        <div className="calendar-wrapper" ref={calendarWrapperRef}>
          <div className="calendar-controls">
            <button className="arrow-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&#8592;</button>
            <h2>{luniAn[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button className="arrow-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&#8594;</button>
          </div>

          <div className="calendar-inner-wrapper">
            <div className="calendar-grid days-header">
              {zileSaptamana.map(zi => <div key={zi}>{zi}</div>)}
            </div>
            <div className="calendar-grid days-body">
              {blanks.map(blank => <div key={`blank-${blank}`} className="calendar-day empty"></div>)}
              {days.map(day => {
                const isBookable = [5, 6, 0].includes(new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay());
                return (
                  <div key={day} className={`calendar-day ${!isBookable ? 'disabled' : ''} ${selectedDayObj?.day === day ? 'selected' : ''}`} onClick={(e) => handleDateClick(day, e.currentTarget)}>
                    <div className="day-number">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDayObj && (
            <div className="thinking-bubble popover-bubble" ref={bubbleRef} style={{ top: `${bubblePosition.top}px`, left: `${bubblePosition.left}px`, transform: 'translateX(-50%)' }}>
              <div className="bubble-arrow" style={{ left: `calc(50% + ${bubblePosition.arrowOffset}px)` }} />
              <button className="close-bubble-btn" onClick={handleCloseBubble}>&times;</button>

              <div className="bubble-body">
                {currentStep === 'slots' && (
                  <>
                    <h3>Intervale libere: {selectedDayObj.day} {luniAn[currentDate.getMonth()]}</h3>
                    <div className="slots-list bubble-list">
                      {availableSlots.map(slot => (
                        <div key={slot.id} className="bubble-slot-card" onClick={() => { setSelectedSlot(slot); setCurrentStep('form'); }}>
                          <strong>🕒 {slot.time}</strong>
                          <span>{slot.availableSpaces} LOC DISPONIBIL</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {currentStep === 'form' && (
                  <>
                    <h3>Informații Rezervare</h3>
                    <div className="bubble-summary">
                      📅 {selectedDayObj.day} {luniAn[currentDate.getMonth()]} | 🕒 {selectedSlot.time}
                    </div>
                    <form onSubmit={handleSubmit} className="bubble-form">
                      <div className="form-row">
                        <div className="input-group">
                          <input type="text" name="firstName" placeholder="Prenume *" value={formData.firstName} onChange={handleInputChange} className={errors.firstName ? 'error' : ''} />
                          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>
                        <div className="input-group">
                          <input type="text" name="lastName" placeholder="Nume *" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? 'error' : ''} />
                          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                      </div>
                      
                      <div className="input-group">
                        <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleInputChange} className={errors.email ? 'error' : ''} />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>

                      <div className="input-group">
                        <input type="tel" name="phone" placeholder="Telefon *" value={formData.phone} onChange={handleInputChange} className={errors.phone ? 'error' : ''} />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                      </div>

                      <div className="input-group">
                        <textarea name="specialRequests" placeholder="Cerințe speciale (opțional)..." value={formData.specialRequests} onChange={handleInputChange} maxLength={500}></textarea>
                      </div>
                      
                      <div className="modal-actions">
                        <button type="submit" className="btn-orange">Confirmă</button>
                        <button type="button" className="btn-orange cancel" onClick={() => setCurrentStep('slots')}>Înapoi</button>
                      </div>
                    </form>
                  </>
                )}

                {currentStep === 'success' && (
                  <div className="bubble-success">
                    <h3>Cerere trimisă!</h3>
                    <p>Vă vom contacta pentru confirmare.</p>
                    <button className="btn-orange" onClick={handleCloseBubble}>Închide</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingPage;