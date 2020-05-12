import React from 'react'

import TextElement from './components/text-element'
import NumericElement from './components/numeric-element'
import SelectElement from './components/select-element'
import CheckboxElement from './components/checkbox-element'

export default class ComponentRegistry {
    constructor(customRegistry = {}) {
        this._registry = {
            enum: SelectElement,
            boolean: CheckboxElement,
            number: NumericElement,
            integer: NumericElement,
            string: TextElement
        }

        Object.assign(this._registry, customRegistry)
    }

    getComponent(property, itemValue, handleChange) {
        const props = {
            property,
            value: itemValue,
            onChange: handleChange,
        }

        const Component =
            this._registry[property.registryKey] || this._registry['string']

        return <Component {...props} />
    }
}
