import React, { Fragment } from 'react'

export default function FormContainer({ property }) {
    return <Fragment>{property.children}</Fragment>
}
