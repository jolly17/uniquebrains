import { useState, useEffect } from 'react'
import './TimeInput.css'

/**
 * Time Input Component with 12-hour format and AM/PM selector
 * Converts between 12-hour display format and 24-hour storage format (HH:mm)
 */
function TimeInput({ value, onChange, required = false, id, name }) {
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState('PM')

  // Convert 24-hour format (HH:mm) to 12-hour format
  useEffect(() => {
    if (value) {
      const [hours24, mins] = value.split(':')
      const h = parseInt(hours24, 10)
      
      setMinute(mins)
      
      if (h === 0) {
        setHour('12')
        setPeriod('AM')
      } else if (h < 12) {
        setHour(h.toString())
        setPeriod('AM')
      } else if (h === 12) {
        setHour('12')
        setPeriod('PM')
      } else {
        setHour((h - 12).toString())
        setPeriod('PM')
      }
    }
  }, [value])

  // Convert 12-hour format to 24-hour format and call onChange
  const updateTime = (newHour, newMinute, newPeriod) => {
    let hours24 = parseInt(newHour, 10)
    
    if (newPeriod === 'AM') {
      if (hours24 === 12) hours24 = 0
    } else {
      if (hours24 !== 12) hours24 += 12
    }
    
    const time24 = `${hours24.toString().padStart(2, '0')}:${newMinute}`
    onChange({ target: { name, value: time24 } })
  }

  const handleHourChange = (e) => {
    const newHour = e.target.value
    setHour(newHour)
    updateTime(newHour, minute, period)
  }

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value
    setMinute(newMinute)
    updateTime(hour, newMinute, period)
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    updateTime(hour, minute, newPeriod)
  }

  return (
    <div className="time-input-container">
      <select
        className="time-input-select hour"
        value={hour}
        onChange={handleHourChange}
        required={required}
      >
        {[...Array(12)].map((_, i) => {
          const h = (i + 1).toString()
          return <option key={h} value={h}>{h}</option>
        })}
      </select>
      
      <span className="time-separator">:</span>
      
      <select
        className="time-input-select minute"
        value={minute}
        onChange={handleMinuteChange}
        required={required}
      >
        {['00', '15', '30', '45'].map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      
      <div className="period-selector">
        <button
          type="button"
          className={`period-btn ${period === 'AM' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('AM')}
        >
          AM
        </button>
        <button
          type="button"
          className={`period-btn ${period === 'PM' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('PM')}
        >
          PM
        </button>
      </div>
    </div>
  )
}

export default TimeInput
