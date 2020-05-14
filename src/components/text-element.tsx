import React, { FormEvent } from 'react'

interface TextElementProperties {
    value: string
    onChange: (event: FormEvent<HTMLInputElement>) => void
}

export default function TextElement({
    value,
    onChange
}: TextElementProperties) {
    return <input type='text' value={value} onChange={onChange} />
}
