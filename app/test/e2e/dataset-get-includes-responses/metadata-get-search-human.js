const metadataGetWithSearchForHuman = cartoFakeDataset => ({
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

module.exports = metadataGetWithSearchForHuman;
