import React from 'react'

export default function CheckboxElement({ property, value, onChange }) {
    const handleChange = (evt) => {
        onChange(evt.target.checked)
    }

    return <input type='checkbox' value={value} onChange={handleChange} />
}
