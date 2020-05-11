import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

function CustomWrapper({ property, error, children }) {
    return (<div className="column col-4">
        <div><b>{property.title}</b></div>
        {children}
        <div style={{ 'color': '#FF0000' }}>{error && error[0].keyword}</div>
    </div>)
}

export function CustomWrapperExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (
        <div className="container">
            <div className="columns">
                <SchemaForm
                    schema={schema}
                    onValid={onValid}
                    wrapper={CustomWrapper}
                    data={data} />
            </div>
        </div>)

}


export const CustomWrapperExampleJson = schema
export const CustomWrapperExampleCode = `
import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

function CustomWrapper({ property, error, children }) {
    return (<div className="column col-4">
        <div><b>{property.title}</b></div>
        {children}
        <div style={{ 'color': '#FF0000' }}>{error && error[0].keyword}</div>
    </div>)
}

export function CustomWrapperExample() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (
        <div className="container">
            <div className="columns">
                <SchemaForm
                    schema={schema}
                    onValid={onValid}
                    wrapper={CustomWrapper}
                    data={data} />
            </div>
        </div>)

}
`