const vocabularyFindById = () => ({
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

module.exports = vocabularyFindById;
