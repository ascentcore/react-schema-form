import React from 'react'

export default function ElementWrapper({ children, property }) {
    const wrapperClass = `ra-elem-wrapper 
        ra-elem-${property.type}     
        ${property.error ? 'ra-error' : ''}`

    return (
        <span className={wrapperClass}>
            <label className='ra-form-label'>{property.title}</label>
            {children}
            {property.error && (
                <span className='ra-elem-error-text'>{property.error[0].keyword}</span>
            )}
        </span>
    )
}
