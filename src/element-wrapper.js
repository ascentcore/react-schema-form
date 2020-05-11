import React from 'react'

export default function ElementWrapper({ children, property, error, path }) {
    const wrapperClass = `ra-elem-wrapper 
        ra-elem-${property.type}     
        ${error ? 'ra-error' : ''}`

    return (
        <span className={wrapperClass}>
            <label className='ra-form-label'>{property.title}</label>
            {children}
            {error && (
                <span className='ra-elem-error-text'>{error[0].keyword}</span>
            )}
        </span>
    )
}
