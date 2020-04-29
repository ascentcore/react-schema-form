import React from 'react'

export default function TextElement({ value, onChange }) {
    return <input type='text' value={value} onChange={onChange} />
}
