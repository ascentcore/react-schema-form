import React, {
    Fragment,
    useState,
    useEffect,
    FormEvent,
    ReactNode
} from 'react'
import { SchemaForm } from '../schema-form'
import ComponentRegistry from '../component-registry'
import { ValidatorError } from '../ui-schema'

export interface SchemaProperty {
    $ref?: string
    items?: SchemaProperty
    type?: string
    title?: string
    description?: string
    properties?: { [key: string]: SchemaProperty }
    required?: string[]
    enum?: string[]
    options?: { [key: string]: string }[]
    labelKey?: string
    valueKey?: string

    path?: string
    registryKey?: string
    error?: ValidatorError[] | boolean
    isRequired?: boolean
}

interface FormElementProperties {
    root: any
    property: SchemaProperty
    path: string
    value: any
    errors: ValidatorError[]
    error: ValidatorError[] | boolean
    handleParentChange: (value: any, childPath: string) => void
    registry: ComponentRegistry
}

export default function FormElement({
    root,
    property,
    path,
    value,
    errors,
    error,
    handleParentChange,
    registry
}: FormElementProperties) {
    const [nest, setNest] = useState<SchemaProperty | null>(null)

    useEffect(() => {
        function processRef($ref: string) {
            const def = $ref.substr($ref.lastIndexOf('/') + 1)
            return root.definitions[def]
        }

        const { $ref, items, properties } = property
        let subSchema: SchemaProperty | null = null

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

    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        let value: FormEvent<HTMLInputElement> | string = event
        if (event.target) {
            value = (event.target as HTMLInputElement).value
        }
        handleParentChange(value, path)
    }

    const handleRemove = (index: number) => () => {
        const newVal = [...value]
        newVal.splice(index, 1)
        handleParentChange(newVal, path)
    }

    function renderSubschema(
        pathKey: string,
        itemValue: any,
        index: null | number
    ) {
        return (
            <SchemaForm
                path={pathKey}
                schema={nest}
                data={itemValue}
                errors={errors}
                parentChange={(subVal: any, key: string) => {
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

    function renderArray(itemValue: any) {
        return (
            <Fragment>
                {itemValue &&
                    itemValue.map((item: any, index: number) => (
                        <Fragment key={`${path}-${itemValue.length}-${index}`}>
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
                        handleParentChange([...(itemValue || []), {}], '')
                    }
                )}
            </Fragment>
        )
    }

    function renderRegistryElement(
        itemValue: any,
        children: ReactNode | null = null
    ) {
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

    function renderItem(itemValue: any, index: number | null = null) {
        if (
            (nest && property.type !== 'array') ||
            (nest && property.type === 'array' && index !== null)
        ) {
            const pathKey = index === null ? path : `${path}[${index}]`
            const subschema: ReactNode = renderSubschema(
                pathKey,
                itemValue,
                index
            )

            return renderRegistryElement(itemValue, subschema)
        } else if (nest && property.type === 'array') {
            const arrayItems: ReactNode = renderArray(itemValue)

            return renderRegistryElement(itemValue, arrayItems)
        } else {
            return renderRegistryElement(itemValue)
        }
    }
    return renderItem(value)
}
