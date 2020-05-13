import React from 'react'

export default function ButtonElement({ value, onChange, children }) {
    return (
        <button onClick={onChange}>{value ? value : children}</button>
    )
}
