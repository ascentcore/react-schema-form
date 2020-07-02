import React, { useEffect, useState } from 'react'
import schema from './custom-registry-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'
import { TextField, Slider } from '@material-ui/core'

import addIcon from './add-icon.png'

import { Map, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function CustomWrapper({ children }) {
    return <div className='column col-12'>{children}</div>
}

function CustomTextField({ property, value, onChange }) {
    const handleChange = (event) => {
        onChange(event.target.value)
    }
    return (
        <TextField
            value={value || ''}
            onChange={handleChange}
            error={!!property.error}
            label={property.title}
            helperText={property.error ? property.error[0].keyword : ' '}
            required={property.isRequired}
        />
    )
}

function CustomAddButton({ property, onChange }) {
    return (
        <img
            className={property.className}
            onClick={onChange}
            src={addIcon}
            style={{ height: '15px' }}
            alt='add icon'
        />
    )
}

function CustomNumericField({ property, value, onChange }) {
    const handleChange = (event, newValue) => {
        onChange(newValue)
    }

    return (
        <Slider
            value={value !== undefined ? value : property.minimum ? property.minimum : 0}
            min={property.minimum ? property.minimum : 0}
            onChange={handleChange}
            valueLabelDisplay='auto'
        />
    )
}

function CustomLocation({ value, onChange }) {
    const [coordinates, setCoordinates] = useState([46.753731, 23.605707])
    useEffect(() => {
        if (value && value.latitude && value.longitude) {
            setCoordinates([value.latitude, value.longitude])
        }
    }, [])

    useEffect(() => {
        if (value && value.latitude && value.longitude) {
            setCoordinates([value.latitude, value.longitude])
        }
    }, [value])

    const onMapClick = (event) => {
        onChange({latitude: event.latlng.lat, longitude: event.latlng.lng})
    }

    return (
        <div style={{ height: '200px', width: '100%' }}>
            <Map center={coordinates} zoom={15} style={{ height: '100%', width: '100%' }} onClick={onMapClick}>
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={coordinates}>
                </Marker>
            </Map>
        </div>
    )
}

export default function CustomRegistryExample() {
    function onSubmit(data, errors) {
        if (!errors || !errors.length) {
            console.log(data)
        }
    }

    const data = {
        firstName: 'test',
        age: 18
    }

    const customRegistry = {
        string: { component: CustomTextField, wrapper: CustomWrapper },
        integer: { component: CustomNumericField, wrapper: CustomWrapper },
        enum: { component: 'RadioElement' },
        addButton: { component: CustomAddButton, wrapper: CustomWrapper }
    }

    const exceptions = {
        keys: {
            writing: { component: 'SelectElement' },
            location: { component: CustomLocation, wrapper: CustomWrapper }
        }
    }

    return (
        <SchemaForm
            schema={schema}
            onSubmit={onSubmit}
            data={data}
            config={{ registry: customRegistry, exceptions: exceptions }}
        />
    )
}
