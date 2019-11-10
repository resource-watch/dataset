const graphFindById = dataset => ({
    data: [{
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'endangered',
            label: 'Endangered',
            synonyms: '',
            default_parent: 'species'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'conservation',
            label: 'Conservation',
            synonyms: '',
            default_parent: 'human_activity'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'animal',
            label: 'Animals',
            synonyms: ['animal'],
            default_parent: 'species'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'global',
            label: 'Global',
            synonyms: '',
            default_parent: 'location'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'table',
            label: 'Table',
            synonyms: '',
            default_parent: 'dataset'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'geospatial',
            label: 'Geospatial',
            synonyms: '',
            default_parent: 'dataset'
        }
    }, {
        type: 'concept',
        attributes: {
            dataset: dataset.id,
            id: 'vector',
            label: 'Vector',
            synonyms: '',
            default_parent: 'geospatial'
        }
    }]
});

module.exports = graphFindById;
