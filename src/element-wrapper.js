import React from 'react'

export default function ElementWrapper({ children, property }) {
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
            return <h5>{property.title}</h5>
        }
    }

    return (
        <span className={wrapperClass}>
            {labelComponent()}
            {children}
            {property.error && (
                <span className='ra-elem-error-text'>
                    {property.error[0].keyword}
                </span>
            )}
        </span>
    )
}
