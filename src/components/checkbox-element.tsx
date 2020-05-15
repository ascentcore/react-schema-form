import React, { FormEvent, useEffect } from 'react'

interface CheckboxElementProperties {
    value: boolean
    onChange: (checked: boolean) => void
}

export default function CheckboxElement({
    value,
    onChange
}: CheckboxElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).checked)
    }

    return (
        <input
            type='checkbox'
            value={`${value || false}`}
            onChange={handleChange}
            checked={value || false}
        />
    )
}
