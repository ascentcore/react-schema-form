import React from 'react'
import schema from './custom-wrapper-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

function CustomWrapper({ property, children }) {
    return (<div className="column col-12">
        <div><b>{property.title}</b></div>
        {children}
    </div>)
}

export default function CustomWrapperExample() {
    function onSubmit(data, errors) {
        if (errors && errors.length) {
            const errorsMessage = errors.map((error) => {
                return error.dataPath.substr(error.dataPath.lastIndexOf('.') + 1) + ' - ' + error.message
            })
            alert(errorsMessage)
        }
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (
        <div className='container'>
            <div className='columns'>
                <SchemaForm schema={schema} onSubmit={onSubmit} wrapper={CustomWrapper} data={data} />
            </div>
        </div>
    )
}
