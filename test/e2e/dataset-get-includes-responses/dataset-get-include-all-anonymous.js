/* eslint-disable max-len */
const datasetGetIncludeAllAnonymous = (dataset) => ({
    id: dataset.id,
    type: 'dataset',
    attributes: {
        name: dataset.name,
        slug: dataset.slug,
        type: null,
        subtitle: dataset.subtitle,
        application: [
            'rw'
        ],
        applicationConfig: dataset.applicationConfig,
        dataPath: dataset.dataPath,
        attributesPath: dataset.attributesPath,
        connectorType: 'rest',
        provider: 'cartodb',
        userId: dataset.userId,
        connectorUrl: dataset.connectorUrl,
        sources: [],
        tableName: dataset.tableName,
        status: 'saved',
        published: true,
        overwrite: true,
        mainDateField: null,
        env: 'production',
        geoInfo: false,
        protected: false,
        legend: {
            binary: [],
            boolean: [],
            byte: [],
            country: [],
            date: [],
            double: [],
            float: [],
            half_float: [],
            integer: [],
            keyword: [],
            nested: [],
            region: [],
            scaled_float: [],
            short: [],
            text: []
        },
        clonedHost: {},
        errorMessage: null,
        taskId: null,
        createdAt: dataset.createdAt.toISOString(),
        updatedAt: dataset.updatedAt.toISOString(),
        dataLastUpdated: dataset.dataLastUpdated.toISOString(),
        metadata: [
            {
                id: '59d538fd66b9630011465ecd',
                type: 'metadata',
                attributes: {
                    dataset: dataset.id,
                    application: 'rw',
                    resource: {
                        id: dataset.id,
                        type: 'dataset'
                    },
                    language: 'en',
                    name: 'Tiger Conservation Landscapes',
                    description: 'These 3 data sets, produced by WWF and RESOLVE, show the location of current tiger habitat and priority areas for habitat conservation. (1) Tiger Conservation Landscapes: Tiger conservation landscapes (TCLs) are large blocks of contiguous or connected area of suitable tiger habitat that that can support at least 5 adult tigers and where tiger presence has been confirmed in the past 10 years. The data set was created by mapping tiger distribution, determined by land cover type, forest extent, and prey base, against a human influence index. Areas of high human influence that overlapped with suitable habitat were not considered tiger habitat. (2) Tx2 Tiger Conservation Landscapes: This data set displays 29 Tx2 tiger conservation landscapes (Tx2 TCLs), defined areas that could double the wild tiger population through proper conservation and management by 2020. (3) Terai Arc Landscape corridors: This data set displays 9 forest corridors on the Nepalese side of the Terai Arc Landscape (TAL). The TAL is an area that encompasses lowlands and the foothills of the Himalayas and contains 14 protected areas in total. Wildlife corridors enable animals to travel between these areas, increasing their long-term survival. Corridors are defined as existing forests connecting current Royal Bengal tiger metapopulations in Nepal and India. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                    source: 'WWF/RESOLVE',
                    info: {
                        rwId: 'bio.030',
                        data_type: 'Vector',
                        name: 'Tiger Conservation Landscapes',
                        sources: [
                            {
                                'source-name': 'World Wildlife Fund (WWF)',
                                id: 0,
                                'source-description': ''
                            },
                            {
                                'source-name': 'Resolve',
                                id: 1,
                                'source-description': ''
                            }
                        ],
                        technical_title: 'Tiger Conservation Landscapes 2.0',
                        functions: 'Location of current tiger habitats, areas of habitat expansion, and critical tiger corridors',
                        cautions: 'Tiger conservation landscapes were created under the assumption that suitable habitat depends on quality and size of land cover and prey base. Land cover data were problematic in certain geographies due to the presence of tree plantations. In some cases, forest cover was overestimated or underestimated. The Tiger Location database, on which this data set was built, is incomplete for some regions, and the data come from a variety of sources and research methods.',
                        citation: '(1) WWF and RESOLVE. "Tiger Conservation Landscapes." Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).  (2) Tiger Conservation Landscapes: Dinerstein, E., Loucks, C.J., Wikramanayake, E., Ginsberg, J., Sanderson, E., Seidensticker, J., Forrest, J.L., Bryja, G., Heydlauff, A., Klenzendorf, S., Mills, J, O\'Brien, T., Shrestha, M, Simons, R., Songer, M. 2007. "The fate of wild tigers." BioScience 57: 508-14. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).  (3) Tx2 Tiger Conservation Landscapes: Wikramanayake, E., Dinerstein, E., Seidensticker, J., Lumpkin, S., Pandav, B., Shrestha, M., Mishra, H., Ballou, J., Johnsingh, A.J.T., Chestin, I., Sunarto, S., Thinley, P., Thapa, K., Jiang, G., Elagupillay, S., Kafley, H., Pradhan, N.M.B., Jigme, K., Teak, S., Cutter, P., Aziz, Md. A., Than, U. 2011. A landscape-based conservation strategy to double the wild tiger population. Conservation Letters, 4 (3):219-227. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).  (4) Terai Arc Landscape corridors: Wikramanayake, E., M. McNight, E. Dinerstein, A. Joshi, B. Gurung, D. Smith. 2004. Designing a Conservation Landscape for Tigers in Human-Dominated Environments. Conservation Biology (18):839-844. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org). ',
                        license: 'Creative Commons Attribution 4.0 International',
                        license_link: 'https://creativecommons.org/licenses/by/4.0/',
                        geographic_coverage: 'Bangladesh, Bhutan, Cambodia, China, India, Indonesia, Laos, Malaysia, Myanmar, Nepal, Russia, Thailand, Vietnam',
                        spatial_resolution: null,
                        date_of_content: null,
                        frequency_of_updates: 'Annual',
                        learn_more_link: 'https://www.worldwildlife.org/publications/tiger-conservation-landscape-data-and-report',
                        data_download_link: null,
                        data_download_original_link: 'http://data.globalforestwatch.org/datasets/04d892c083f54c638228931da081467b_3'
                    },
                    columns: {
                        tcl_name: {
                            alias: 'Name',
                            description: 'Tiger Conservation Landscape name'
                        },
                        area_ha: {
                            alias: 'Area (ha)',
                            description: 'Area in hectares'
                        },
                        shape_Area: {
                            alias: 'Shape Area'
                        },
                        tx2_tcl: {
                            alias: 'Tx2 Target',
                            description: 'Progress on action plan to double tiger population'
                        },
                        tcl_id: {
                            alias: 'ID',
                            description: 'Tiger Conservation Landscape unique ID'
                        }
                    },
                    createdAt: '2017-10-04T19:39:41.859Z',
                    updatedAt: '2019-02-05T20:30:28.882Z',
                    status: 'published'
                }
            }
        ],
        widget: [
            {
                id: 'a783b2ec-fda3-4706-bf34-e34f50225f8d',
                type: 'widget',
                attributes: {
                    name: 'Tiger Conservation Landscapes and Corridors',
                    dataset: dataset.id,
                    slug: 'Tiger-Conservation-Landscapes-2007-2011-and-Corridors-2014',
                    userId: '5980838ae24e6a1dae3dd446',
                    description: '',
                    source: '',
                    authors: '',
                    application: [
                        'rw'
                    ],
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
                            embed: {
                                src: ''
                            },
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
                                datasetID: dataset.id,
                                type: 'esriFieldTypeString',
                                name: 'tcl_name'
                            },
                            value: {
                                tableName: 'conservationMapServer3',
                                datasetID: dataset.id,
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
                        interaction_config: [
                            {
                                config: {
                                    fields: [
                                        {
                                            format: '.2f',
                                            label: 'Tcl_name',
                                            key: 'x'
                                        },
                                        {
                                            format: '.2s',
                                            label: 'Shape_Area',
                                            key: 'y'
                                        }
                                    ]
                                },
                                name: 'tooltip'
                            }
                        ],
                        marks: [
                            {
                                axes: [
                                    {
                                        grid: 'true',
                                        properties: {
                                            axis: {
                                                strokeWidth: {
                                                    value: 0
                                                }
                                            }
                                        },
                                        offset: 5,
                                        tickSizeEnd: 0,
                                        scale: 'y',
                                        type: 'y'
                                    }
                                ],
                                scales: [
                                    {
                                        padding: 1,
                                        points: true,
                                        round: true,
                                        bandSize: 25,
                                        domain: {
                                            field: 'x',
                                            data: 'table'
                                        },
                                        range: 'width',
                                        type: 'ordinal',
                                        name: 'x'
                                    }
                                ],
                                marks: [
                                    {
                                        properties: {
                                            enter: {
                                                y2: {
                                                    value: 0,
                                                    scale: 'y'
                                                },
                                                y: {
                                                    field: 'y',
                                                    scale: 'y'
                                                },
                                                width: {
                                                    offset: -15,
                                                    band: true,
                                                    scale: 'x'
                                                },
                                                xc: {
                                                    field: 'x',
                                                    scale: 'x'
                                                }
                                            }
                                        },
                                        from: {
                                            data: 'table'
                                        },
                                        type: 'rect'
                                    },
                                    {
                                        properties: {
                                            enter: {
                                                opacity: [
                                                    {
                                                        value: 1,
                                                        test: 'datum.min_y < 0'
                                                    },
                                                    {
                                                        value: 0
                                                    }
                                                ],
                                                strokeWidth: {
                                                    value: 1
                                                },
                                                stroke: {
                                                    value: '#A9ABAD'
                                                },
                                                x2: {
                                                    field: {
                                                        group: 'width'
                                                    }
                                                },
                                                x: {
                                                    value: '0'
                                                },
                                                y: {
                                                    value: '0',
                                                    scale: 'y'
                                                }
                                            }
                                        },
                                        from: {
                                            data: 'stats'
                                        },
                                        type: 'rule'
                                    },
                                    {
                                        axes: [
                                            {
                                                properties: {
                                                    labels: {
                                                        baseline: {
                                                            value: 'middle'
                                                        },
                                                        align: {
                                                            value: 'right'
                                                        },
                                                        angle: {
                                                            value: 270
                                                        },
                                                        text: {
                                                            template: '{{ datum["data"] | truncate:25 }}'
                                                        }
                                                    },
                                                    axis: {
                                                        strokeWidth: {
                                                            value: 0
                                                        }
                                                    }
                                                },
                                                tickSizeEnd: 0,
                                                scale: 'x',
                                                type: 'x'
                                            }
                                        ],
                                        properties: {
                                            update: {
                                                y: {
                                                    offset: 5,
                                                    signal: 'height'
                                                }
                                            }
                                        },
                                        type: 'group'
                                    }
                                ],
                                properties: {
                                    update: {
                                        width: {
                                            field: 'width'
                                        }
                                    }
                                },
                                from: {
                                    data: 'layout'
                                },
                                type: 'group'
                            }
                        ],
                        axes: [
                            {
                                properties: {
                                    labels: {
                                        text: {
                                            template: ''
                                        }
                                    }
                                },
                                tickSize: 0,
                                ticks: 0,
                                scale: 'x',
                                type: 'x'
                            },
                            {
                                properties: {
                                    axis: {
                                        strokeWidth: {
                                            value: 0
                                        }
                                    }
                                },
                                offset: 5,
                                tickSizeEnd: 0,
                                scale: 'y',
                                type: 'y'
                            }
                        ],
                        scales: [
                            {
                                real: false,
                                domain: {
                                    field: 'x',
                                    data: 'table'
                                },
                                range: 'width',
                                type: 'ordinal',
                                name: 'x'
                            },
                            {
                                domain: {
                                    field: 'y',
                                    data: 'table'
                                },
                                range: 'height',
                                type: 'linear',
                                name: 'y'
                            }
                        ],
                        data: [
                            {
                                values: [],
                                name: 'table'
                            },
                            {
                                transform: [
                                    {
                                        summarize: [
                                            {
                                                ops: [
                                                    'distinct'
                                                ],
                                                field: 'x'
                                            }
                                        ],
                                        type: 'aggregate'
                                    },
                                    {
                                        expr: '(datum["distinct_x"] + 1) * 25',
                                        field: 'width',
                                        type: 'formula'
                                    }
                                ],
                                source: 'table',
                                name: 'layout'
                            },
                            {
                                transform: [
                                    {
                                        summarize: [
                                            {
                                                ops: [
                                                    'min'
                                                ],
                                                field: 'y'
                                            }
                                        ],
                                        type: 'aggregate'
                                    }
                                ],
                                source: 'table',
                                name: 'stats'
                            }
                        ],
                        width: 1
                    },
                    template: false,
                    createdAt: '2017-10-31T21:35:40.342Z',
                    updatedAt: '2017-10-31T21:35:40.342Z'
                }
            }
        ],
        layer: [
            {
                id: '84698937-429c-4141-8752-8d8f36a7e98c',
                type: 'layer',
                attributes: {
                    name: 'Tiger Conservation Landscapes and Corridors',
                    slug: 'tiger-conservation-landscapes',
                    dataset: dataset.id,
                    description: 'Locations of tiger conservation landscapes, Tx2 tiger conservation landscapes, and Terai Arc Landscape corridors.',
                    application: [
                        'rw'
                    ],
                    iso: [
                        ''
                    ],
                    provider: 'cartodb',
                    userId: '57a0aa1071e394dd32ffe137',
                    default: true,
                    protected: false,
                    published: true,
                    env: 'production',
                    layerConfig: {
                        account: 'wri-01',
                        body: {
                            maxzoom: 18,
                            minzoom: 3,
                            extent: [
                                16769672.5095,
                                -3209132.19552,
                                3189564.31628,
                                5850795.89306
                            ],
                            layers: [
                                {
                                    type: 'mapnik',
                                    options: {
                                        sql: 'SELECT * FROM tiger_conservation_landscapes',
                                        cartocss: '#tiger_conservation_landscapes {  polygon-fill: #FFCC00;  polygon-opacity: 0.8;  line-color: #FF5C00;  line-width: 0.5;  line-opacity: 0.5;}#tiger_conservation_landscapes[tx2_tcl=1] {  polygon-fill: #FF5C00;  line-color: #081B47;}',
                                        cartocss_version: '2.3.0'
                                    }
                                }
                            ]
                        }
                    },
                    legendConfig: {
                        items: [
                            {
                                color: '#FFCC00',
                                name: 'Tiger conservation landscapes'
                            },
                            {
                                color: '#FF5C00',
                                name: 'Tx2 tiger conservation landscapes'
                            },
                            {
                                color: '#229a00',
                                name: 'Terai arc landscape corridors'
                            }
                        ],
                        type: 'basic'
                    },
                    interactionConfig: {
                        output: [
                            {
                                column: 'tcl_name',
                                format: null,
                                prefix: '',
                                property: 'Tiger Conservation Landscape',
                                suffix: '',
                                type: 'esriFieldTypeString'
                            },
                            {
                                column: 'area_ha',
                                format: null,
                                prefix: '',
                                property: 'Area',
                                suffix: ' ha',
                                type: 'esriFieldTypeInteger'
                            }
                        ]
                    },
                    applicationConfig: {
                        default: true,
                        active: true,
                        global: true,
                        metadata: 'tiger_conservation_landscapes'
                    },
                    staticImageConfig: {},
                    updatedAt: '2018-08-09T16:41:49.948Z'
                }
            }
        ],
        vocabulary: [],
        graph: [
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'endangered',
                    label: 'Endangered',
                    synonyms: '',
                    default_parent: 'species'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'conservation',
                    label: 'Conservation',
                    synonyms: '',
                    default_parent: 'human_activity'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'animal',
                    label: 'Animals',
                    synonyms: [
                        'animal'
                    ],
                    default_parent: 'species'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'global',
                    label: 'Global',
                    synonyms: '',
                    default_parent: 'location'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'table',
                    label: 'Table',
                    synonyms: '',
                    default_parent: 'dataset'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'geospatial',
                    label: 'Geospatial',
                    synonyms: '',
                    default_parent: 'dataset'
                }
            },
            {
                type: 'concept',
                attributes: {
                    dataset: dataset.id,
                    id: 'vector',
                    label: 'Vector',
                    synonyms: '',
                    default_parent: 'geospatial'
                }
            }
        ],
        user: {},
        widgetRelevantProps: [],
        layerRelevantProps: []
    }
});

module.exports = datasetGetIncludeAllAnonymous;
