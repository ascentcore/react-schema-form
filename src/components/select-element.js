import React from 'react'

export default function SelectElement({ property, value, onChange }) {
    const options = property.enum

    return (
        <select onChange={onChange}>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    )
}
