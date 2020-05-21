import React, { Fragment, ReactNode } from 'react'

interface ElementContainerProperties {
    children: ReactNode
}

export default function ElementContainer({
    children
}: ElementContainerProperties) {
    return <Fragment>{children}</Fragment>
}
