const widgetsFindById = cartoFakeDataset => ({
    data: [{
        id: 'a783b2ec-fda3-4706-bf34-e34f50225f8d',
        type: 'widget',
        attributes: {
            name: 'Tiger Conservation Landscapes and Corridors',
            dataset: cartoFakeDataset.id,
            slug: 'Tiger-Conservation-Landscapes-2007-2011-and-Corridors-2014',
            userId: '5980838ae24e6a1dae3dd446',
            description: '',
            source: '',
            authors: '',
            application: ['rw'],
            verified: false,
            default: false,
            protected: false,
            defaultEditableWidget: false,
            published: false,
            freeze: false,
            env: 'production',
            queryUrl: '',
            widgetConfig: {
                paramsConfig: {
                    embed: { src: '' },
                    layer: '84698937-429c-4141-8752-8d8f36a7e98c',
                    band: null,
                    areaIntersection: null,
                    filters: [],
                    chartType: 'bar',
                    aggregateFunction: null,
                    orderBy: null,
                    size: null,
                    color: null,
                    category: {
                        tableName: 'conservationMapServer3',
                        datasetID: cartoFakeDataset.id,
                        type: 'esriFieldTypeString',
                        name: 'tcl_name'
                    },
                    value: {
                        tableName: 'conservationMapServer3',
                        datasetID: cartoFakeDataset.id,
                        type: 'esriFieldTypeDouble',
                        name: 'shape_Area'
                    },
                    limit: 500,
                    visualizationType: 'map'
                },
                lng: 114.78515625000001,
                lat: 5.7908968128719565,
                zoom: 3,
                layer_id: '84698937-429c-4141-8752-8d8f36a7e98c',
                type: 'map',
                interaction_config: [{
                    config: {
                        fields: [{
                            format: '.2f',
                            label: 'Tcl_name',
                            key: 'x'
                        }, { format: '.2s', label: 'Shape_Area', key: 'y' }]
                    },
                    name: 'tooltip'
                }],
                marks: [{
                    axes: [{
                        grid: 'true',
                        properties: { axis: { strokeWidth: { value: 0 } } },
                        offset: 5,
                        tickSizeEnd: 0,
                        scale: 'y',
                        type: 'y'
                    }],
                    scales: [{
                        padding: 1,
                        points: true,
                        round: true,
                        bandSize: 25,
                        domain: { field: 'x', data: 'table' },
                        range: 'width',
                        type: 'ordinal',
                        name: 'x'
                    }],
                    marks: [{
                        properties: {
                            enter: {
                                y2: { value: 0, scale: 'y' },
                                y: { field: 'y', scale: 'y' },
                                width: { offset: -15, band: true, scale: 'x' },
                                xc: { field: 'x', scale: 'x' }
                            }
                        },
                        from: { data: 'table' },
                        type: 'rect'
                    }, {
                        properties: {
                            enter: {
                                opacity: [{ value: 1, test: 'datum.min_y < 0' }, { value: 0 }],
                                strokeWidth: { value: 1 },
                                stroke: { value: '#A9ABAD' },
                                x2: { field: { group: 'width' } },
                                x: { value: '0' },
                                y: { value: '0', scale: 'y' }
                            }
                        },
                        from: { data: 'stats' },
                        type: 'rule'
                    }, {
                        axes: [{
                            properties: {
                                labels: {
                                    baseline: { value: 'middle' },
                                    align: { value: 'right' },
                                    angle: { value: 270 },
                                    text: { template: '{{ datum["data"] | truncate:25 }}' }
                                },
                                axis: { strokeWidth: { value: 0 } }
                            },
                            tickSizeEnd: 0,
                            scale: 'x',
                            type: 'x'
                        }],
                        properties: { update: { y: { offset: 5, signal: 'height' } } },
                        type: 'group'
                    }],
                    properties: { update: { width: { field: 'width' } } },
                    from: { data: 'layout' },
                    type: 'group'
                }],
                axes: [{
                    properties: { labels: { text: { template: '' } } },
                    tickSize: 0,
                    ticks: 0,
                    scale: 'x',
                    type: 'x'
                }, {
                    properties: { axis: { strokeWidth: { value: 0 } } },
                    offset: 5,
                    tickSizeEnd: 0,
                    scale: 'y',
                    type: 'y'
                }],
                scales: [{
                    real: false,
                    domain: { field: 'x', data: 'table' },
                    range: 'width',
                    type: 'ordinal',
                    name: 'x'
                }, {
                    domain: { field: 'y', data: 'table' }, range: 'height', type: 'linear', name: 'y'
                }],
                data: [{ values: [], name: 'table' }, {
                    transform: [{
                        summarize: [{
                            ops: ['distinct'],
                            field: 'x'
                        }],
                        type: 'aggregate'
                    }, { expr: '(datum["distinct_x"] + 1) * 25', field: 'width', type: 'formula' }],
                    source: 'table',
                    name: 'layout'
                }, {
                    transform: [{ summarize: [{ ops: ['min'], field: 'y' }], type: 'aggregate' }],
                    source: 'table',
                    name: 'stats'
                }],
                width: 1
            },
            template: false,
            createdAt: '2017-10-31T21:35:40.342Z',
            updatedAt: '2017-10-31T21:35:40.342Z'
        }
    }]
});

module.exports = widgetsFindById;
