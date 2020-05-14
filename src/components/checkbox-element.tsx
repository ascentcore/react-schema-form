import React, { FormEvent } from 'react'

interface CheckboxElementProperties {
    value: string
    onChange: (checked: boolean) => void
}

export default function CheckboxElement({
    value,
    onChange
}: CheckboxElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).checked)
    }

    return <input type='checkbox' value={value} onChange={handleChange} />
}
