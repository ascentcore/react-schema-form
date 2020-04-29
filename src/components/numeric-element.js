import React from 'react'

export default function NumericElement({ property, value, onChange }) {
    const handleChange = (evt) => {
        const { type } = property
        const { value } = evt.target
        if (type === 'integer') {
            onChange(parseInt(value))
        } else {
            onChange(parseFloat(value))
        }
    }

    return <input type='number' value={value} onChange={handleChange} />
}
