import React, { ReactNode } from 'react'
import { SchemaProperty } from './components/form-element'

interface ElementWrapperProperties {
    children: ReactNode
    property: SchemaProperty
}

export default function ElementWrapper({ children, property }: ElementWrapperProperties) {
    const { type } = property
    const wrapperClass = `${
        property.type !== 'object' && property.type !== 'array' ? 'ra-elem-wrapper ' : 'ra-elem-instance'
    }
        ra-elem-${property.type}     
        ${property.error ? 'ra-error' : ''}`

    const labelComponent = () => {
        if (type !== 'array' && type !== 'object') {
            return (
                <label className='ra-form-label'>
                    {property.title}
                    {property.isRequired && '*'}
                </label>
            )
        } else {
            return (
                <h5>
                    {property.title}
                    {property.isRequired && '*'}
                </h5>
            )
        }
    }

    return (
        <span className={wrapperClass}>
            {labelComponent()}
            {children}
            {property.error && (
                <span className='ra-elem-error-text'>
                    {typeof property.error !== 'boolean' && property.error[0].keyword}
                </span>
            )}
        </span>
    )
}
