import React, { FormEvent, CSSProperties } from 'react'
import { SchemaProperty } from './form-element'

const CONTAINER_STYLE: CSSProperties = { position: 'relative' }
const FILE_INPUT_STYLE: CSSProperties = { position: 'absolute', opacity: '0', width: '100%' }

interface FileElementProperties {
    property: SchemaProperty
    value: string
    onChange: (value: string | { filename: string; content: string }) => void
}

export default function FileElement({ property, value, onChange }: FileElementProperties) {
    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement
        if (inputElement.files && inputElement.files.length) {
            const reader = new FileReader()
            reader.addEventListener('load', function () {
                if (reader.result) {
                    let fileContent =
                        typeof reader.result === 'string' ? reader.result : Buffer.from(reader.result).toString()
                    fileContent = fileContent.split(';base64,')[1]
                    if (property.instanceof === 'file') {
                        onChange({ filename: inputElement.files![0].name, content: fileContent })
                    } else {
                        onChange(fileContent)
                    }
                }
            })
            reader.readAsDataURL(inputElement.files[0])
        }
    }
    return (
        <span style={CONTAINER_STYLE}>
            <input
                type='file'
                onChange={handleChange}
                style={FILE_INPUT_STYLE}
                {...(property.contentMediaType ? { accept: property.contentMediaType } : {})}
            />
            <button>Choose file</button>
            <span>{value ? ' File uploaded' : ' No file chosen'}</span>
        </span>
    )
}
