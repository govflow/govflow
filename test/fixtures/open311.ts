
export const validServiceData = [
    {
        'service_code': '001',
        'service_name': 'Cans left out 24x7',
        'description': 'Garbage or recycling cans that have been left out for more than 24 hours after collection. Violators will be cited.',
        'metadata': true,
        'type': 'realtime',
        'keywords': 'lorem, ipsum, dolor',
        'group': 'sanitation'
    },
    {
        'service_code': '002',
        'metadata': true,
        'type': 'realtime',
        'keywords': 'lorem, ipsum, dolor',
        'group': 'street',
        'service_name': 'Construction plate shifted',
        'description': 'Metal construction plate covering the street or sidewalk has been moved.'
    },
    {
        'service_code': '003',
        'metadata': true,
        'type': 'realtime',
        'keywords': 'lorem, ipsum, dolor',
        'group': 'street',
        'service_name': 'Curb or curb ramp defect',
        'description': 'Sidewalk curb or ramp has problems such as cracking, missing pieces, holes, and/or chipped curb.'
    }
]

export const validServiceRequestData = [
    {
        'service_code': '001',
        'first_name': 'Peter',
        'last_name': 'Pan',
        'description': 'There is garbage all over the sidewalk.',
        'address': 'Sunset Boulevarde, Hollywood',
        'email': 'email@example.com',
        'phone': '+1 972 609 9933',
        'lat': -238.008,
        'long': 327.4830
    },
]

export const validServiceDefinitionData = {
    // example service definition response from https://wiki.open311.org/GeoReport_v2/
    'service_code': 'DMV66',
    'attributes': [
        {
            'variable': true,
            'code': 'WHISHETN',
            'datatype': 'singlevaluelist',
            'required': true,
            'datatype_description': null,
            'order': 1,
            'description': 'What is the ticket/tag/DL number?',
            'values': [
                {
                    'key': 123,
                    'name': 'Ford'
                },
                {
                    'key': 124,
                    'name': 'Chrysler'
                }
            ]
        }
    ]
}

export const invalidServiceDefinitionData = {
    // similar but invalid data
    'service_code': 'DMV66',
    'attrs': [
        {
            'variable': true,
            'code': 'WHISHETN',
            'datatype': 'singlevaluelist',
            'required': true,
            'datatype_description': null,
            'order': 1,
            'description': 'What is the ticket/tag/DL number?',
            'values': [
                {
                    'key': 123,
                    'name': 'Ford'
                },
                {
                    'key': 124,
                    'name': 'Chrysler'
                }
            ]
        }
    ]
}