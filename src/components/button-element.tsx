import React, { ReactNode, FormEvent } from 'react'
import { SchemaProperty } from './form-element'

interface ButtonElementProperties {
    property: SchemaProperty
    value: string
    onChange: (event: FormEvent) => void
    children: ReactNode
}

export default function ButtonElement({
    property,
    value,
    onChange,
    children
}: ButtonElementProperties) {
    return <button className={property.className} onClick={onChange}>{value ? value : children}</button>
}
