import React, { ReactNode } from 'react'
import { SchemaProperty } from './components/form-element'

interface ElementWrapperProperties {
    children: ReactNode
    property: SchemaProperty
}

export default function ElementWrapper({
    children,
    property
}: ElementWrapperProperties) {
    const { type } = property
    const wrapperClass = `${
        property.type !== 'object' && property.type !== 'array'
            ? 'ra-elem-wrapper '
            : 'ra-elem-instance'
    }
        ra-elem-${property.type}     
        ${property.error ? 'ra-error' : ''}`

    const labelComponent = () => {
        if (type !== 'array' && type !== 'object') {
            return (
                <label className='ra-form-label'>
                    {property.title || property.path}
                    {property.isRequired && '*'}
                </label>
            )
        } else {
            return <div className="ra-form-title">{property.title}</div>
        }
    }

    return (
        <span className={wrapperClass}>
            {labelComponent()}
            {children}
            {property.error && (
                <span className='ra-elem-error-text'>
                    {typeof property.error !== 'boolean' &&
                        property.error[0].keyword}
                </span>
            )}
        </span>
    )
}
