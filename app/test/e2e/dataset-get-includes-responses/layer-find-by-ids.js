const layersFindById = cartoFakeDataset => ({
    data: [{
        id: '84698937-429c-4141-8752-8d8f36a7e98c',
        type: 'layer',
        attributes: {
            name: 'Tiger Conservation Landscapes and Corridors',
            slug: 'tiger-conservation-landscapes',
            dataset: cartoFakeDataset.id,
            description: 'Locations of tiger conservation landscapes, Tx2 tiger conservation landscapes, and Terai Arc Landscape corridors.',
            application: ['rw'],
            iso: [''],
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
                    extent: [16769672.5095, -3209132.19552, 3189564.31628, 5850795.89306],
                    layers: [{
                        type: 'mapnik',
                        options: {
                            sql: 'SELECT * FROM tiger_conservation_landscapes',
                            cartocss: '#tiger_conservation_landscapes {  polygon-fill: #FFCC00;  polygon-opacity: 0.8;  line-color: #FF5C00;  line-width: 0.5;  line-opacity: 0.5;}#tiger_conservation_landscapes[tx2_tcl=1] {  polygon-fill: #FF5C00;  line-color: #081B47;}',
                            cartocss_version: '2.3.0'
                        }
                    }]
                }
            },
            legendConfig: {
                items: [{
                    color: '#FFCC00',
                    name: 'Tiger conservation landscapes'
                }, { color: '#FF5C00', name: 'Tx2 tiger conservation landscapes' }, {
                    color: '#229a00',
                    name: 'Terai arc landscape corridors'
                }],
                type: 'basic'
            },
            interactionConfig: {
                output: [{
                    column: 'tcl_name',
                    format: null,
                    prefix: '',
                    property: 'Tiger Conservation Landscape',
                    suffix: '',
                    type: 'esriFieldTypeString'
                }, {
                    column: 'area_ha',
                    format: null,
                    prefix: '',
                    property: 'Area',
                    suffix: ' ha',
                    type: 'esriFieldTypeInteger'
                }]
            },
            applicationConfig: {
                default: true, active: true, global: true, metadata: 'tiger_conservation_landscapes'
            },
            staticImageConfig: {},
            updatedAt: '2018-08-09T16:41:49.948Z'
        }
    }]
});

module.exports = layersFindById;
