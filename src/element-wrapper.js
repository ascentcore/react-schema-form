import React from 'react'

export default function ElementWrapper({ children, property, error, path }) {

    return (
        <div>
            <label>{property.title}</label>
            {children}
            {error && error[0].keyword}
        </div>
    )
}
