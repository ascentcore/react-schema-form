import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

function CustomWrapper({ property, children }) {
    return (<div>
        <div><b>{property.title}</b></div>
        {children}
    </div>)
}

export default function() {

    function onValid(data) {
        console.log(data)
    }

    const data = {
        firstName: 'test'
    }

    return (<SchemaForm 
        schema={schema} 
        onValid={onValid}
        wrapper={CustomWrapper}
        data={data} />)

}