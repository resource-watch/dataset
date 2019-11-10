/* eslint-disable max-len */
const metadataFindById = dataset => ({
    data: [{
        id: '59d538fd66b9630011465ecd',
        type: 'metadata',
        attributes: {
            dataset: dataset.id,
            application: 'rw',
            resource: { id: dataset.id, type: 'dataset' },
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

module.exports = metadataFindById;
