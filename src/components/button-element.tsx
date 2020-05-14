import React, { ReactNode, FormEvent } from 'react'

interface ButtonElementProperties {
    value: string
    onChange: (event: FormEvent) => void
    children: ReactNode
}

export default function ButtonElement({
    value,
    onChange,
    children
}: ButtonElementProperties) {
    return <button onClick={onChange}>{value ? value : children}</button>
}
