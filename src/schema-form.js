import React, { Fragment, useState } from 'react'
import ElementWrapper from './element-wrapper'
import FormElement from './form-element'
import UISchema from './ui-schema'

export const SchemaForm = ({
    schema,
    wrapper,
    parentChange,
    data,
    config,
    onValid,
    path = '',
    errors: parentErrors
}) => {
    if (!schema) {
        throw new Error('schema must be provided to the SchemaForm component')
    }

    const [obj, setObj] = useState(Object.assign({}, data))
    const [keys] = useState(Object.keys(schema.properties))
    const [instance] = useState(new UISchema(schema))
    const [errors, setErrors] = useState([])

    const FormElementWrapper = wrapper || ElementWrapper

    const handleParentChange = (key) => (value) => {
        console.log(key, value)
        const newValue = Object.assign({}, obj, { [key]: value })
        setObj(newValue)
        if (parentChange) {
            parentChange(newValue)
        }
    }

    const handleSubmit = () => {
        console.log(obj)
        const result = instance.validate(obj)
        const errors = result ? [] : instance.validator.errors
        errors.forEach((err) => {
            if (err.params && err.params.missingProperty) {
                err.dataPath += `.${err.params.missingProperty}`
            }
        })
        setErrors(errors)

        console.log(errors)
        // if (result) {
        //   onSubmit(obj);
        // }
    }

    return (
        <Fragment>
            {keys.map((key) => {
                const prop = schema.properties[key]
                return (
                    <FormElementWrapper
                        key={key}
                        property={prop}
                        path={`${path}.${key}`}
                        errors={parentErrors || errors}
                    >
                        <FormElement
                            errors={parentErrors || errors}
                            value={obj ? obj[key] : undefined}
                            property={prop}
                            path={`${path}.${key}`}
                            root={schema}
                            handleParentChange={handleParentChange(key)}
                        />
                    </FormElementWrapper>
                )
            })}
            {!parentChange && <button onClick={handleSubmit}>Submit</button>}
        </Fragment>
    )
}
