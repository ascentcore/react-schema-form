import React from 'react'

import TextElement from './components/text-element'
import NumericElement from './components/numeric-element'
import SelectElement from './components/select-element'
import CheckboxElement from './components/checkbox-element'

import ElementWrapper from './element-wrapper'

export default class ComponentRegistry {
    constructor(customRegistry = {}, wrapper = ElementWrapper) {
        this._registry = {
            enum: { component: SelectElement, wrapper: wrapper },
            boolean: { component: CheckboxElement, wrapper: wrapper },
            number: { component: NumericElement, wrapper: wrapper },
            integer: { component: NumericElement, wrapper: wrapper },
            string: { component: TextElement, wrapper: wrapper }
        }

        Object.values(customRegistry).forEach((registryRecord) => {
            if (!registryRecord.wrapper) {
                registryRecord.wrapper = wrapper
            }
        })

        Object.assign(this._registry, customRegistry)
    }

    getComponent(property, itemValue, handleChange) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange
        }

        const Component =
            (this._registry[property.registryKey] &&
                this._registry[property.registryKey].component) ||
            this._registry['string'].component

        const Wrapper =
            (this._registry[property.registryKey] &&
                this._registry[property.registryKey].wrapper) ||
            this._registry['string'].wrapper

        return (
            <Wrapper {...props}>
                <Component {...props} />
            </Wrapper>
        )
    }
}