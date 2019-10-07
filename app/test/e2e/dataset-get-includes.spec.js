/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const fs = require('fs');
const path = require('path');
const { createDataset, deserializeDataset } = require('./utils');

const { getTestServer } = require('./test-server');
const { getUUID } = require('./utils');
const { USERS } = require('./test.constants');

const should = chai.should();

const requester = getTestServer();

let cartoFakeDataset;


describe('Get datasets with includes tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        nock.cleanAll();

        Dataset.remove({}).exec();

        cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
    });


    it('Get datasets with includes should return requested data except users (anonymous request)', async () => {

        const datasetIds = [cartoFakeDataset.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, {
                data: [{
                    id: '59de3f9f4886ed001151a1d6',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'rw',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Terrestrial Human Footprint',
                        description: 'The global human footprint map, created by Venter et al. (2016), used the human footprint framework to compile remotely sensed and bottom-up survey information on 8 variables measuring the direct and indirect human pressures on the environment in 1993 and 2009. The study included data on (1) extent of built environments, (2) crop land, (3) pasture land, (4) human population density, (5) nighttime lights, (6) railways, (7) roads, and (8) navigable waterways. These pressures were weighted according to estimates of their relative levels of human pressure and then summed together to create the standardized human footprint for all non-Antarctic land areas at 1 km resolution. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                        source: 'UNBC/WCS/ETH Zurich/UQ/JCU/CUNY/CIESIN',
                        info: {
                            rwId: 'bio.015',
                            data_type: 'Raster',
                            name: 'Terrestrial Human Footprint',
                            sources: [{
                                'source-name': 'University of Northern British Columbia (UNBC)',
                                id: 0,
                                'source-description': ''
                            }, {
                                'source-name': 'Wildlife Conservation Society (WCS)',
                                id: 1,
                                'source-description': ''
                            }, {
                                'source-name': 'Swiss Federal Institute of Technology in Zurich (ETH Zurich)',
                                id: 2,
                                'source-description': ''
                            }, {
                                'source-name': 'University of Queensland (UQ)',
                                id: 3,
                                'source-description': ''
                            }, {
                                'source-name': 'James Cook University (JCU)',
                                id: 4,
                                'source-description': ''
                            }, {
                                'source-name': 'City University of New York (CUNY)',
                                id: 5,
                                'source-description': ''
                            }, {
                                'source-name': 'Columbia University Earth Institute Center for International Earth Science Information Network (CIESIN)',
                                id: 6,
                                'source-description': ''
                            }],
                            technical_title: 'Global Terrestrial Human Footprint maps',
                            functions: 'A globally standardized measure of the cumulative human pressure on the terrestrial environment',
                            cautions: 'Only the 2009 data layer is visible on Resource Watch. The study did not fully account for all human pressures, and a lack of available data resulted in 3 of their pressures being static through time, which would cause an underestimation of human footprint expansion if these pressures expanded at a higher than average rate. Also, the human footprint measures the pressure humans place on nature, not the realized state or impacts on natural systems or their biodiversity. Significant scope exists to determine how natural systems respond to cumulating human pressures, and if nonlinearity or thresholds exist where pressures lead to accelerated impacts.',
                            citation: '(1) Venter, O., E.W. Sanderson, A. Magrach, J.R. Allan, J. Beher, K.R. Jones, H.P. Possingham, W.F. Laurance, P. Wood, B.M. Fekete, M.A. Levy, J.E. Watson. 2016. "Global Terrestrial Human Footprint Maps for 1993 and 2009." Scientific Data 3: 160067. http://dx.doi.org/10.1038/sdata.2016.67. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).   (2) Venter, O., E.W. Sanderson, A. Magrach, J.R. Allan, J. Beher, K.R. Jones, H.P. Possingham, W.F. Laurance, P. Wood, B.M. Fekete, M.A. Levy, J.E. Watson. 2016. Data from "Global Terrestrial Human Footprint Maps for 1993 and 2009." Dryad Digital Repository. http://dx.doi.org/10.5061/dryad.052q5.2. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).',
                            license: 'Public domain',
                            license_link: 'https://creativecommons.org/publicdomain/zero/1.0/',
                            geographic_coverage: 'Global',
                            spatial_resolution: '1 km',
                            date_of_content: '1993, 2009',
                            frequency_of_updates: null,
                            learn_more_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5',
                            data_download_link: null,
                            data_download_original_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5'
                        },
                        createdAt: '2017-10-11T15:58:23.860Z',
                        updatedAt: '2019-02-05T20:30:27.799Z',
                        status: 'published'
                    }
                }, {
                    id: '5a4d85a88a5a2f0011ef49f2',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'prep',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Terrestrial Human Footprint',
                        description: 'The global human footprint map, created by Venter et al. (2016), used the human footprint framework to compile remotely sensed and bottom-up survey information on 8 variables measuring the direct and indirect human pressures on the environment in 1993 and 2009. The study included data on (1) extent of built environments, (2) crop land, (3) pasture land, (4) human population density, (5) nighttime lights, (6) railways, (7) roads, and (8) navigable waterways. These pressures were weighted according to estimates of their relative levels of human pressure and then summed together to create the standardized human footprint for all non-Antarctic land areas at 1 km resolution.\n\nPREPdata shows only a subset of this data set. For access to the full data set and additional information, see the Download from Original Source link.',
                        source: 'Venter et al.',
                        citation: '[1] Venter O, Sanderson EW, Magrach A, Allan JR, Beher J, Jones KR, Possingham HP, Laurance WF, Wood P, Fekete BM, Levy MA, Watson JE (2016) Global terrestrial Human Footprint maps for 1993 and 2009. Scientific Data 3: 160067. https://doi.org/10.1038/sdata.2016.67. Accessed through PREPdata, [date]. www.prepdata.org.\n\n[2] Venter O, Sanderson EW, Magrach A, Allan JR, Beher J, Jones KR, Possingham HP, Laurance WF, Wood P, Fekete BM, Levy MA, Watson JEM (2016) Data from: Global terrestrial Human Footprint maps for 1993 and 2009. Dryad Digital Repository. https://doi.org/10.5061/dryad.052q5.2. Accessed through PREPdata, [date]. www.prepdata.org.',
                        info: {
                            data_type: 'Raster',
                            date_of_content: '1993, 2009',
                            endpoint: '',
                            function: 'A measure of the cumulative human pressure on the terrestrial environment',
                            geographic_coverage: 'Global',
                            language: 'English',
                            learn_more_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5',
                            license: 'CC0 1.0 Universal Public Domain Dedication',
                            license_link: 'https://creativecommons.org/publicdomain/zero/1.0',
                            loca: { indicator_id: '' },
                            nexgddp: { indicator_id: '' },
                            'organization-long': 'University of Northern British Columbia',
                            published_date: '2016',
                            spatial_resolution: '1 km',
                            technical_title: 'Global terrestrial Human Footprint maps for 1993 and 2009',
                            wri_rw_id: 'prep_0063'
                        },
                        createdAt: '2018-01-04T01:38:48.002Z',
                        updatedAt: '2019-02-04T17:35:59.162Z',
                        status: 'published'
                    }
                }]
            });

        nock(process.env.CT_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                env: 'production',
                includes: 'layer,metadata,vocabulary,widget,graph,user',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [cartoFakeDataset.id] });


        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [USERS.ADMIN.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [] });


        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
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


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '3b7c3e8f-f7c0-466f-8f7c-01d73afc0988', type: 'dataset' },
                        tags: ['vector', 'geospatial', 'table', 'commodity', 'commerce'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '4d7ce999-1e37-418f-b8a6-1816b29e901a', type: 'dataset' },
                        tags: ['population', 'poverty', 'table', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '85345c7d-b608-4698-a44d-f5554885b99e', type: 'dataset' },
                        tags: ['geospatial', 'global', 'historical', 'annual', 'population', 'raster'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'bae38478-a7c7-400c-a086-a425b61261e9', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'land', 'agriculture', 'food_and_agriculture', 'forest_cover', 'forest', 'settlements', 'urban_expansion'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'cebc516b-0d62-442b-97e0-6f89dcbb1562', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'agriculture', 'food_and_agriculture', 'forest', 'forest_cover', 'future'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '8f92a786-0b80-4746-8d14-85a70898d4ba', type: 'dataset' },
                        tags: ['historical', 'global', 'population', 'human_activity', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }]
            });


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    id: '59d538fd66b9630011465ecd',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'rw',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Tiger Conservation Landscapes',
                        description: 'These 3 data sets, produced by WWF and RESOLVE, show the location of current tiger habitat and priority areas for habitat conservation. (1) Tiger Conservation Landscapes: Tiger conservation landscapes (TCLs) are large blocks of contiguous or connected area of suitable tiger habitat that that can support at least 5 adult tigers and where tiger presence has been confirmed in the past 10 years. The data set was created by mapping tiger distribution, determined by land cover type, forest extent, and prey base, against a human influence index. Areas of high human influence that overlapped with suitable habitat were not considered tiger habitat. (2) Tx2 Tiger Conservation Landscapes: This data set displays 29 Tx2 tiger conservation landscapes (Tx2 TCLs), defined areas that could double the wild tiger population through proper conservation and management by 2020. (3) Terai Arc Landscape corridors: This data set displays 9 forest corridors on the Nepalese side of the Terai Arc Landscape (TAL). The TAL is an area that encompasses lowlands and the foothills of the Himalayas and contains 14 protected areas in total. Wildlife corridors enable animals to travel between these areas, increasing their long-term survival. Corridors are defined as existing forests connecting current Royal Bengal tiger metapopulations in Nepal and India. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                        source: 'WWF/RESOLVE',
                        info: {
                            rwId: 'bio.030',
                            data_type: 'Vector',
                            name: 'Tiger Conservation Landscapes',
                            sources: [{
                                'source-name': 'World Wildlife Fund (WWF)',
                                id: 0,
                                'source-description': ''
                            }, { 'source-name': 'Resolve', id: 1, 'source-description': '' }],
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
                            tcl_name: { alias: 'Name', description: 'Tiger Conservation Landscape name' },
                            area_ha: { alias: 'Area (ha)', description: 'Area in hectares' },
                            shape_Area: { alias: 'Shape Area' },
                            tx2_tcl: {
                                alias: 'Tx2 Target',
                                description: 'Progress on action plan to double tiger population'
                            },
                            tcl_id: { alias: 'ID', description: 'Tiger Conservation Landscape unique ID' }
                        },
                        createdAt: '2017-10-04T19:39:41.859Z',
                        updatedAt: '2019-02-05T20:30:28.882Z',
                        status: 'published'
                    }
                }]
            });

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
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

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'endangered',
                        label: 'Endangered',
                        synonyms: '',
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'conservation',
                        label: 'Conservation',
                        synonyms: '',
                        default_parent: 'human_activity'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'animal',
                        label: 'Animals',
                        synonyms: ['animal'],
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'global',
                        label: 'Global',
                        synonyms: '',
                        default_parent: 'location'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'table',
                        label: 'Table',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'geospatial',
                        label: 'Geospatial',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'vector',
                        label: 'Vector',
                        synonyms: '',
                        default_parent: 'geospatial'
                    }
                }]
            });


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal({
            id: cartoFakeDataset.id,
            type: 'dataset',
            attributes: {
                name: cartoFakeDataset.name,
                slug: cartoFakeDataset.slug,
                type: null,
                subtitle: cartoFakeDataset.subtitle,
                application: [
                    'rw'
                ],
                applicationConfig: cartoFakeDataset.applicationConfig,
                dataPath: cartoFakeDataset.dataPath,
                attributesPath: cartoFakeDataset.attributesPath,
                connectorType: 'rest',
                provider: 'cartodb',
                userId: '1a10d7c6e0a37126611fd7a7',
                connectorUrl: cartoFakeDataset.connectorUrl,
                sources: [],
                tableName: cartoFakeDataset.tableName,
                status: 'saved',
                published: true,
                overwrite: true,
                verified: false,
                blockchain: {},
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
                createdAt: cartoFakeDataset.createdAt.toISOString(),
                updatedAt: cartoFakeDataset.updatedAt.toISOString(),
                dataLastUpdated: cartoFakeDataset.dataLastUpdated.toISOString(),
                metadata: [
                    {
                        id: '59d538fd66b9630011465ecd',
                        type: 'metadata',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            application: 'rw',
                            resource: {
                                id: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'endangered',
                            label: 'Endangered',
                            synonyms: '',
                            default_parent: 'species'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'conservation',
                            label: 'Conservation',
                            synonyms: '',
                            default_parent: 'human_activity'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'global',
                            label: 'Global',
                            synonyms: '',
                            default_parent: 'location'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'table',
                            label: 'Table',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'geospatial',
                            label: 'Geospatial',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
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
    });

    it('Get datasets with includes should return requested data including users (ADMIN user request)', async () => {

        const datasetIds = [cartoFakeDataset.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, {
                data: [{
                    id: '59de3f9f4886ed001151a1d6',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'rw',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Terrestrial Human Footprint',
                        description: 'The global human footprint map, created by Venter et al. (2016), used the human footprint framework to compile remotely sensed and bottom-up survey information on 8 variables measuring the direct and indirect human pressures on the environment in 1993 and 2009. The study included data on (1) extent of built environments, (2) crop land, (3) pasture land, (4) human population density, (5) nighttime lights, (6) railways, (7) roads, and (8) navigable waterways. These pressures were weighted according to estimates of their relative levels of human pressure and then summed together to create the standardized human footprint for all non-Antarctic land areas at 1 km resolution. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                        source: 'UNBC/WCS/ETH Zurich/UQ/JCU/CUNY/CIESIN',
                        info: {
                            rwId: 'bio.015',
                            data_type: 'Raster',
                            name: 'Terrestrial Human Footprint',
                            sources: [{
                                'source-name': 'University of Northern British Columbia (UNBC)',
                                id: 0,
                                'source-description': ''
                            }, {
                                'source-name': 'Wildlife Conservation Society (WCS)',
                                id: 1,
                                'source-description': ''
                            }, {
                                'source-name': 'Swiss Federal Institute of Technology in Zurich (ETH Zurich)',
                                id: 2,
                                'source-description': ''
                            }, {
                                'source-name': 'University of Queensland (UQ)',
                                id: 3,
                                'source-description': ''
                            }, {
                                'source-name': 'James Cook University (JCU)',
                                id: 4,
                                'source-description': ''
                            }, {
                                'source-name': 'City University of New York (CUNY)',
                                id: 5,
                                'source-description': ''
                            }, {
                                'source-name': 'Columbia University Earth Institute Center for International Earth Science Information Network (CIESIN)',
                                id: 6,
                                'source-description': ''
                            }],
                            technical_title: 'Global Terrestrial Human Footprint maps',
                            functions: 'A globally standardized measure of the cumulative human pressure on the terrestrial environment',
                            cautions: 'Only the 2009 data layer is visible on Resource Watch. The study did not fully account for all human pressures, and a lack of available data resulted in 3 of their pressures being static through time, which would cause an underestimation of human footprint expansion if these pressures expanded at a higher than average rate. Also, the human footprint measures the pressure humans place on nature, not the realized state or impacts on natural systems or their biodiversity. Significant scope exists to determine how natural systems respond to cumulating human pressures, and if nonlinearity or thresholds exist where pressures lead to accelerated impacts.',
                            citation: '(1) Venter, O., E.W. Sanderson, A. Magrach, J.R. Allan, J. Beher, K.R. Jones, H.P. Possingham, W.F. Laurance, P. Wood, B.M. Fekete, M.A. Levy, J.E. Watson. 2016. "Global Terrestrial Human Footprint Maps for 1993 and 2009." Scientific Data 3: 160067. http://dx.doi.org/10.1038/sdata.2016.67. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).   (2) Venter, O., E.W. Sanderson, A. Magrach, J.R. Allan, J. Beher, K.R. Jones, H.P. Possingham, W.F. Laurance, P. Wood, B.M. Fekete, M.A. Levy, J.E. Watson. 2016. Data from "Global Terrestrial Human Footprint Maps for 1993 and 2009." Dryad Digital Repository. http://dx.doi.org/10.5061/dryad.052q5.2. Accessed through Resource Watch, (date). [www.resourcewatch.org](www.resourcewatch.org).',
                            license: 'Public domain',
                            license_link: 'https://creativecommons.org/publicdomain/zero/1.0/',
                            geographic_coverage: 'Global',
                            spatial_resolution: '1 km',
                            date_of_content: '1993, 2009',
                            frequency_of_updates: null,
                            learn_more_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5',
                            data_download_link: null,
                            data_download_original_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5'
                        },
                        createdAt: '2017-10-11T15:58:23.860Z',
                        updatedAt: '2019-02-05T20:30:27.799Z',
                        status: 'published'
                    }
                }, {
                    id: '5a4d85a88a5a2f0011ef49f2',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'prep',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Terrestrial Human Footprint',
                        description: 'The global human footprint map, created by Venter et al. (2016), used the human footprint framework to compile remotely sensed and bottom-up survey information on 8 variables measuring the direct and indirect human pressures on the environment in 1993 and 2009. The study included data on (1) extent of built environments, (2) crop land, (3) pasture land, (4) human population density, (5) nighttime lights, (6) railways, (7) roads, and (8) navigable waterways. These pressures were weighted according to estimates of their relative levels of human pressure and then summed together to create the standardized human footprint for all non-Antarctic land areas at 1 km resolution.\n\nPREPdata shows only a subset of this data set. For access to the full data set and additional information, see the Download from Original Source link.',
                        source: 'Venter et al.',
                        citation: '[1] Venter O, Sanderson EW, Magrach A, Allan JR, Beher J, Jones KR, Possingham HP, Laurance WF, Wood P, Fekete BM, Levy MA, Watson JE (2016) Global terrestrial Human Footprint maps for 1993 and 2009. Scientific Data 3: 160067. https://doi.org/10.1038/sdata.2016.67. Accessed through PREPdata, [date]. www.prepdata.org.\n\n[2] Venter O, Sanderson EW, Magrach A, Allan JR, Beher J, Jones KR, Possingham HP, Laurance WF, Wood P, Fekete BM, Levy MA, Watson JEM (2016) Data from: Global terrestrial Human Footprint maps for 1993 and 2009. Dryad Digital Repository. https://doi.org/10.5061/dryad.052q5.2. Accessed through PREPdata, [date]. www.prepdata.org.',
                        info: {
                            data_type: 'Raster',
                            date_of_content: '1993, 2009',
                            endpoint: '',
                            function: 'A measure of the cumulative human pressure on the terrestrial environment',
                            geographic_coverage: 'Global',
                            language: 'English',
                            learn_more_link: 'http://datadryad.org/resource/doi:10.5061/dryad.052q5',
                            license: 'CC0 1.0 Universal Public Domain Dedication',
                            license_link: 'https://creativecommons.org/publicdomain/zero/1.0',
                            loca: { indicator_id: '' },
                            nexgddp: { indicator_id: '' },
                            'organization-long': 'University of Northern British Columbia',
                            published_date: '2016',
                            spatial_resolution: '1 km',
                            technical_title: 'Global terrestrial Human Footprint maps for 1993 and 2009',
                            wri_rw_id: 'prep_0063'
                        },
                        createdAt: '2018-01-04T01:38:48.002Z',
                        updatedAt: '2019-02-04T17:35:59.162Z',
                        status: 'published'
                    }
                }]
            });

        nock(process.env.CT_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                env: 'production',
                includes: 'layer,metadata,vocabulary,widget,graph,user',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [cartoFakeDataset.id] });


        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [USERS.ADMIN.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    ...USERS.ADMIN,
                    _id: USERS.ADMIN.id
                }]
            });


        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
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


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '3b7c3e8f-f7c0-466f-8f7c-01d73afc0988', type: 'dataset' },
                        tags: ['vector', 'geospatial', 'table', 'commodity', 'commerce'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '4d7ce999-1e37-418f-b8a6-1816b29e901a', type: 'dataset' },
                        tags: ['population', 'poverty', 'table', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '85345c7d-b608-4698-a44d-f5554885b99e', type: 'dataset' },
                        tags: ['geospatial', 'global', 'historical', 'annual', 'population', 'raster'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'bae38478-a7c7-400c-a086-a425b61261e9', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'land', 'agriculture', 'food_and_agriculture', 'forest_cover', 'forest', 'settlements', 'urban_expansion'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'cebc516b-0d62-442b-97e0-6f89dcbb1562', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'agriculture', 'food_and_agriculture', 'forest', 'forest_cover', 'future'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '8f92a786-0b80-4746-8d14-85a70898d4ba', type: 'dataset' },
                        tags: ['historical', 'global', 'population', 'human_activity', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }]
            });


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    id: '59d538fd66b9630011465ecd',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'rw',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Tiger Conservation Landscapes',
                        description: 'These 3 data sets, produced by WWF and RESOLVE, show the location of current tiger habitat and priority areas for habitat conservation. (1) Tiger Conservation Landscapes: Tiger conservation landscapes (TCLs) are large blocks of contiguous or connected area of suitable tiger habitat that that can support at least 5 adult tigers and where tiger presence has been confirmed in the past 10 years. The data set was created by mapping tiger distribution, determined by land cover type, forest extent, and prey base, against a human influence index. Areas of high human influence that overlapped with suitable habitat were not considered tiger habitat. (2) Tx2 Tiger Conservation Landscapes: This data set displays 29 Tx2 tiger conservation landscapes (Tx2 TCLs), defined areas that could double the wild tiger population through proper conservation and management by 2020. (3) Terai Arc Landscape corridors: This data set displays 9 forest corridors on the Nepalese side of the Terai Arc Landscape (TAL). The TAL is an area that encompasses lowlands and the foothills of the Himalayas and contains 14 protected areas in total. Wildlife corridors enable animals to travel between these areas, increasing their long-term survival. Corridors are defined as existing forests connecting current Royal Bengal tiger metapopulations in Nepal and India. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                        source: 'WWF/RESOLVE',
                        info: {
                            rwId: 'bio.030',
                            data_type: 'Vector',
                            name: 'Tiger Conservation Landscapes',
                            sources: [{
                                'source-name': 'World Wildlife Fund (WWF)',
                                id: 0,
                                'source-description': ''
                            }, { 'source-name': 'Resolve', id: 1, 'source-description': '' }],
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
                            tcl_name: { alias: 'Name', description: 'Tiger Conservation Landscape name' },
                            area_ha: { alias: 'Area (ha)', description: 'Area in hectares' },
                            shape_Area: { alias: 'Shape Area' },
                            tx2_tcl: {
                                alias: 'Tx2 Target',
                                description: 'Progress on action plan to double tiger population'
                            },
                            tcl_id: { alias: 'ID', description: 'Tiger Conservation Landscape unique ID' }
                        },
                        createdAt: '2017-10-04T19:39:41.859Z',
                        updatedAt: '2019-02-05T20:30:28.882Z',
                        status: 'published'
                    }
                }]
            });

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
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

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'endangered',
                        label: 'Endangered',
                        synonyms: '',
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'conservation',
                        label: 'Conservation',
                        synonyms: '',
                        default_parent: 'human_activity'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'animal',
                        label: 'Animals',
                        synonyms: ['animal'],
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'global',
                        label: 'Global',
                        synonyms: '',
                        default_parent: 'location'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'table',
                        label: 'Table',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'geospatial',
                        label: 'Geospatial',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'vector',
                        label: 'Vector',
                        synonyms: '',
                        default_parent: 'geospatial'
                    }
                }]
            });


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1&loggedUser=${JSON.stringify(USERS.ADMIN)}`);

        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal({
            id: cartoFakeDataset.id,
            type: 'dataset',
            attributes: {
                name: cartoFakeDataset.name,
                slug: cartoFakeDataset.slug,
                type: null,
                subtitle: cartoFakeDataset.subtitle,
                application: [
                    'rw'
                ],
                applicationConfig: cartoFakeDataset.applicationConfig,
                dataPath: cartoFakeDataset.dataPath,
                attributesPath: cartoFakeDataset.attributesPath,
                connectorType: 'rest',
                provider: 'cartodb',
                userId: '1a10d7c6e0a37126611fd7a7',
                connectorUrl: cartoFakeDataset.connectorUrl,
                sources: [],
                tableName: cartoFakeDataset.tableName,
                status: 'saved',
                published: true,
                overwrite: true,
                verified: false,
                blockchain: {},
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
                createdAt: cartoFakeDataset.createdAt.toISOString(),
                updatedAt: cartoFakeDataset.updatedAt.toISOString(),
                dataLastUpdated: cartoFakeDataset.dataLastUpdated.toISOString(),
                metadata: [
                    {
                        id: '59d538fd66b9630011465ecd',
                        type: 'metadata',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            application: 'rw',
                            resource: {
                                id: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'endangered',
                            label: 'Endangered',
                            synonyms: '',
                            default_parent: 'species'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'conservation',
                            label: 'Conservation',
                            synonyms: '',
                            default_parent: 'human_activity'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'global',
                            label: 'Global',
                            synonyms: '',
                            default_parent: 'location'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'table',
                            label: 'Table',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'geospatial',
                            label: 'Geospatial',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'vector',
                            label: 'Vector',
                            synonyms: '',
                            default_parent: 'geospatial'
                        }
                    }
                ],
                user: {
                    name: USERS.ADMIN.name,
                    email: USERS.ADMIN.email,
                    role: USERS.ADMIN.role
                },
                widgetRelevantProps: [],
                layerRelevantProps: []
            }
        });
    });

    it('Get datasets with includes and filter by role should return requested data including users (ADMIN user request)', async () => {

        const datasetIds = [cartoFakeDataset.id];

        nock(process.env.CT_URL)
            .get('/auth/user/ids/ADMIN')
            .reply(200, {
                data: [
                    cartoFakeDataset.userId,
                ]
            });

        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [USERS.ADMIN.id] })
            .reply(200, {
                data: [{
                    ...USERS.ADMIN,
                    _id: USERS.ADMIN.id
                }]
            });


        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [cartoFakeDataset.id] })
            .reply(200, {
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


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [cartoFakeDataset.id] })
            .reply(200, {
                data: [{
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '3b7c3e8f-f7c0-466f-8f7c-01d73afc0988', type: 'dataset' },
                        tags: ['vector', 'geospatial', 'table', 'commodity', 'commerce'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '4d7ce999-1e37-418f-b8a6-1816b29e901a', type: 'dataset' },
                        tags: ['population', 'poverty', 'table', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '85345c7d-b608-4698-a44d-f5554885b99e', type: 'dataset' },
                        tags: ['geospatial', 'global', 'historical', 'annual', 'population', 'raster'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'bae38478-a7c7-400c-a086-a425b61261e9', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'land', 'agriculture', 'food_and_agriculture', 'forest_cover', 'forest', 'settlements', 'urban_expansion'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: 'cebc516b-0d62-442b-97e0-6f89dcbb1562', type: 'dataset' },
                        tags: ['geospatial', 'global', 'land_use', 'agriculture', 'food_and_agriculture', 'forest', 'forest_cover', 'future'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }, {
                    type: 'vocabulary',
                    attributes: {
                        resource: { id: '8f92a786-0b80-4746-8d14-85a70898d4ba', type: 'dataset' },
                        tags: ['historical', 'global', 'population', 'human_activity', 'geospatial'],
                        name: 'knowledge_graph',
                        application: 'rw'
                    }
                }]
            });


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [cartoFakeDataset.id] })
            .reply(200, {
                data: [{
                    id: '59d538fd66b9630011465ecd',
                    type: 'metadata',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        application: 'rw',
                        resource: { id: cartoFakeDataset.id, type: 'dataset' },
                        language: 'en',
                        name: 'Tiger Conservation Landscapes',
                        description: 'These 3 data sets, produced by WWF and RESOLVE, show the location of current tiger habitat and priority areas for habitat conservation. (1) Tiger Conservation Landscapes: Tiger conservation landscapes (TCLs) are large blocks of contiguous or connected area of suitable tiger habitat that that can support at least 5 adult tigers and where tiger presence has been confirmed in the past 10 years. The data set was created by mapping tiger distribution, determined by land cover type, forest extent, and prey base, against a human influence index. Areas of high human influence that overlapped with suitable habitat were not considered tiger habitat. (2) Tx2 Tiger Conservation Landscapes: This data set displays 29 Tx2 tiger conservation landscapes (Tx2 TCLs), defined areas that could double the wild tiger population through proper conservation and management by 2020. (3) Terai Arc Landscape corridors: This data set displays 9 forest corridors on the Nepalese side of the Terai Arc Landscape (TAL). The TAL is an area that encompasses lowlands and the foothills of the Himalayas and contains 14 protected areas in total. Wildlife corridors enable animals to travel between these areas, increasing their long-term survival. Corridors are defined as existing forests connecting current Royal Bengal tiger metapopulations in Nepal and India. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.',
                        source: 'WWF/RESOLVE',
                        info: {
                            rwId: 'bio.030',
                            data_type: 'Vector',
                            name: 'Tiger Conservation Landscapes',
                            sources: [{
                                'source-name': 'World Wildlife Fund (WWF)',
                                id: 0,
                                'source-description': ''
                            }, { 'source-name': 'Resolve', id: 1, 'source-description': '' }],
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
                            tcl_name: { alias: 'Name', description: 'Tiger Conservation Landscape name' },
                            area_ha: { alias: 'Area (ha)', description: 'Area in hectares' },
                            shape_Area: { alias: 'Shape Area' },
                            tx2_tcl: {
                                alias: 'Tx2 Target',
                                description: 'Progress on action plan to double tiger population'
                            },
                            tcl_id: { alias: 'ID', description: 'Tiger Conservation Landscape unique ID' }
                        },
                        createdAt: '2017-10-04T19:39:41.859Z',
                        updatedAt: '2019-02-05T20:30:28.882Z',
                        status: 'published'
                    }
                }]
            });

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [cartoFakeDataset.id] })
            .reply(200, {
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

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [cartoFakeDataset.id] })
            .reply(200, {
                data: [{
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'endangered',
                        label: 'Endangered',
                        synonyms: '',
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'conservation',
                        label: 'Conservation',
                        synonyms: '',
                        default_parent: 'human_activity'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'animal',
                        label: 'Animals',
                        synonyms: ['animal'],
                        default_parent: 'species'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'global',
                        label: 'Global',
                        synonyms: '',
                        default_parent: 'location'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'table',
                        label: 'Table',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'geospatial',
                        label: 'Geospatial',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                }, {
                    type: 'concept',
                    attributes: {
                        dataset: cartoFakeDataset.id,
                        id: 'vector',
                        label: 'Vector',
                        synonyms: '',
                        default_parent: 'geospatial'
                    }
                }]
            });


        const response = await requester.get(`/api/v1/dataset?includes=layer,metadata,vocabulary,widget,graph,user&user.role=ADMIN&loggedUser=${JSON.stringify(USERS.ADMIN)}`);

        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal({
            id: cartoFakeDataset.id,
            type: 'dataset',
            attributes: {
                name: cartoFakeDataset.name,
                slug: cartoFakeDataset.slug,
                type: null,
                subtitle: cartoFakeDataset.subtitle,
                application: [
                    'rw'
                ],
                dataPath: cartoFakeDataset.dataPath,
                attributesPath: cartoFakeDataset.attributesPath,
                connectorType: 'rest',
                provider: 'cartodb',
                userId: '1a10d7c6e0a37126611fd7a7',
                connectorUrl: cartoFakeDataset.connectorUrl,
                sources: [],
                tableName: cartoFakeDataset.tableName,
                status: 'saved',
                published: true,
                overwrite: true,
                verified: false,
                blockchain: {},
                mainDateField: null,
                env: 'production',
                applicationConfig: {
                    rw: {
                        foo: 'bar'
                    }
                },
                geoInfo: false,
                protected: false,
                legend: {
                    date: [],
                    region: [],
                    country: [],
                    nested: [],
                    integer: [],
                    short: [],
                    byte: [],
                    double: [],
                    float: [],
                    half_float: [],
                    scaled_float: [],
                    boolean: [],
                    binary: [],
                    text: [],
                    keyword: []
                },
                clonedHost: {},
                errorMessage: null,
                taskId: null,
                createdAt: cartoFakeDataset.createdAt.toISOString(),
                updatedAt: cartoFakeDataset.updatedAt.toISOString(),
                dataLastUpdated: cartoFakeDataset.dataLastUpdated.toISOString(),
                metadata: [
                    {
                        id: '59d538fd66b9630011465ecd',
                        type: 'metadata',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            application: 'rw',
                            resource: {
                                id: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'endangered',
                            label: 'Endangered',
                            synonyms: '',
                            default_parent: 'species'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'conservation',
                            label: 'Conservation',
                            synonyms: '',
                            default_parent: 'human_activity'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
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
                            dataset: cartoFakeDataset.id,
                            id: 'global',
                            label: 'Global',
                            synonyms: '',
                            default_parent: 'location'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'table',
                            label: 'Table',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'geospatial',
                            label: 'Geospatial',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    },
                    {
                        type: 'concept',
                        attributes: {
                            dataset: cartoFakeDataset.id,
                            id: 'vector',
                            label: 'Vector',
                            synonyms: '',
                            default_parent: 'geospatial'
                        }
                    }
                ],
                user: {
                    name: 'John Admin',
                    email: 'user@control-tower.org',
                    role: 'ADMIN'
                },
                widgetRelevantProps: [],
                layerRelevantProps: []
            }
        });
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(() => {
        Dataset.remove({}).exec();
    });
});
