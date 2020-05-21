import React, { FormEvent } from 'react'

interface TextElementProperties {
    value: string
    onChange: (value: string) => void
}

export default function TextElement({
    value,
    onChange
}: TextElementProperties) {

    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        onChange((event.target as HTMLInputElement).value)
    }

    return <input type='text' value={value || ""} onChange={handleChange} />
}
