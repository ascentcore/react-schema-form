import TextElement from './text-element'
import FileElement from './file-element'
import NumericElement from './numeric-element'
import SelectElement from './select-element'
import RadioElement from './radio-element'
import CheckboxElement from './checkbox-element'
import ButtonElement from './button-element'
import MultipleSelectElement from './multiple-select-element'

import { ReactNode } from 'react'

export const InputElements: { [key: string]: ReactNode } = {
    TextElement,
    FileElement,
    NumericElement,
    SelectElement,
    CheckboxElement,
    ButtonElement,
    RadioElement,
    MultipleSelectElement
}
