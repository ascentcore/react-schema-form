import React, { ReactNode } from 'react'

import { InputElements } from './components'

import ElementContainer from './components/element-container'

import ElementWrapper from './element-wrapper'
import { SchemaProperty } from './components/form-element'

export interface RegistryKeys {
    [key: string]: { component?: ReactNode | string; wrapper?: ReactNode }
}

const transformStringEntries = (registryEntries: RegistryKeys) => {

    Object.entries(registryEntries).forEach((registryEntry) => {
        if (typeof registryEntry[1].component === 'string') {
            if (InputElements[registryEntry[1].component]) {
                registryEntry[1].component = InputElements[registryEntry[1].component]
            } else {
                registryEntry[1].component = ElementContainer
            }
        }
    })
}

export default class ComponentRegistry {
    _registry: RegistryKeys
    _wrapper: ReactNode
    _exceptions: {
        paths: RegistryKeys
        keys: RegistryKeys
    }

    constructor(customRegistry = {}, wrapper: ReactNode = ElementWrapper, exceptions = { paths: {}, keys: {} }) {
        this._registry = {
            enum: { component: InputElements['SelectElement'], wrapper: wrapper },
            boolean: { component: InputElements['CheckboxElement'], wrapper: wrapper },
            number: { component: InputElements['NumericElement'], wrapper: wrapper },
            integer: { component: InputElements['NumericElement'], wrapper: wrapper },
            string: { component: InputElements['TextElement'], wrapper: wrapper },
            file: { component: InputElements['FileElement'], wrapper: wrapper },
            button: { component: InputElements['ButtonElement'], wrapper: ElementContainer },
            addButton: { component: InputElements['ButtonElement'], wrapper: ElementContainer },
            removeButton: { component: InputElements['ButtonElement'], wrapper: ElementContainer }
        }

        Object.entries(customRegistry).forEach((customRegistryRecord) => {
            Object.assign(this._registry[customRegistryRecord[0]], customRegistryRecord[1])
        })

        this._wrapper = wrapper
        this._exceptions = Object.assign({ paths: {}, keys: {} }, exceptions)

        transformStringEntries(this._registry)
        transformStringEntries(this._exceptions.paths)
        transformStringEntries(this._exceptions.keys)
    }

    getComponent(
        property: SchemaProperty,
        itemValue: any,
        handleChange: (value: string | number | boolean) => void,
        children: ReactNode | null = null
    ) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange,
            children: children
        }

        const pathException = property.path && this._exceptions.paths[property.path]

        const keyException =
            property.path && this._exceptions.keys[property.path.substr(property.path.lastIndexOf('.') + 1)]

        const Component: any =
            (pathException && pathException.component) ||
            (keyException && keyException.component) ||
            (this._registry[property.registryKey!] && this._registry[property.registryKey!].component) ||
            ElementContainer

        const Wrapper: any =
            (pathException && pathException.wrapper) ||
            (keyException && keyException.wrapper) ||
            (this._registry[property.registryKey!] && this._registry[property.registryKey!].wrapper) ||
            this._wrapper

        return (
            <Wrapper {...props}>
                <Component {...props} />
            </Wrapper>
        )
    }
}
