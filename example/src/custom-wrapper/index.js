import React from 'react'
import schema from './custom-wrapper-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

function CustomWrapper({ property, error, children }) {
    return (<div className="column col-12">
        <div><b>{property.title}</b></div>
        {children}
        <div style={{ 'color': '#FF0000' }}>{error && error[0].keyword}</div>
    </div>)
}

export default function CustomWrapperExample() {

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
