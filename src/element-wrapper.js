import React from 'react'

export default function ElementWrapper({ children, errors, path }) {
    const currentErrors = errors.filter((err) => err.dataPath === path)

    return (
        <div>
            {children}
            {currentErrors &&
                currentErrors.length > 0 &&
                currentErrors[0].keyword}
        </div>
    )
}
