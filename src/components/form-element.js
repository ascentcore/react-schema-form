import React, { Fragment, useState, useEffect } from 'react'
import { SchemaForm } from '../schema-form'

export default function FormElement({
    root,
    property,
    path,
    value,
    errors,
    error,
    handleParentChange,
    registry
}) {
    const [nest, setNest] = useState(null)

    useEffect(() => {
        function processRef($ref) {
            const def = $ref.substr($ref.lastIndexOf('/') + 1)
            return root.definitions[def]
        }

        const { $ref, items, properties } = property
        let subSchema

        if ($ref) {
            subSchema = processRef($ref)
        } else if (items) {
            if (items.$ref) {
                subSchema = processRef(items.$ref)
            } else if (items.properties) {
                subSchema = items
            }
        }

        if (!subSchema && properties) {
            subSchema = property
        }

        if (subSchema) {
            setNest(subSchema)
        }
    }, [property])

    const handleChange = (evt) => {
        let value = evt
        if (evt.target) {
            value = evt.target.value
        }
        handleParentChange(value, path)
    }

    const handleRemove = (index) => () => {
        const newVal = [...value]
        newVal.splice(index, 1)
        handleParentChange(newVal, path)
    }

    function renderSubschema(pathKey, itemValue, index) {
        return (
            <SchemaForm
                path={pathKey}
                schema={nest}
                data={itemValue}
                errors={errors}
                parentChange={(subVal, key) => {
                    if (index !== null) {
                        const copy = [...value]
                        copy[index] = subVal
                        handleParentChange(copy, key)
                    } else {
                        handleParentChange(subVal, key)
                    }
                }}
            />
        )
    }

    function renderArray(itemValue) {
        return (
            <Fragment>
                {itemValue &&
                    itemValue.map((item, index) => (
                        <Fragment key={`${path}-${index}`}>
                            {renderItem(item, index)}
                            {registry.getComponent(
                                { registryKey: 'button' },
                                'Remove item',
                                handleRemove(index)
                            )}
                        </Fragment>
                    ))}
                {registry.getComponent(
                    { registryKey: 'button' },
                    'Add item',
                    () => {
                        handleParentChange([...(itemValue || []), {}])
                    }
                )}
            </Fragment>
        )
    }

    function renderRegistryElement(itemValue, children = null) {
        const registryKey =
            property.enum || property.options ? 'enum' : property.type
        const key = path.substr(path.lastIndexOf('.') + 1)
        const isRequired = root.required && root.required.indexOf(key) > -1

        return registry.getComponent(
            {
                ...property,
                path,
                registryKey,
                error,
                isRequired
            },
            itemValue,
            handleChange,
            children
        )
    }

    function renderItem(itemValue, index = null) {
        if (
            (nest && property.type !== 'array') ||
            (nest && property.type === 'array' && index !== null)
        ) {
            const pathKey = index === null ? path : `${path}[${index}]`
            const subschema = renderSubschema(pathKey, itemValue, index)

            return renderRegistryElement(itemValue, subschema)
        } else if (nest && property.type === 'array') {
            const arrayItems = renderArray(itemValue)

            return renderRegistryElement(itemValue, arrayItems)
        } else {
            return renderRegistryElement(itemValue)
        }
    }
    return renderItem(value)
}
