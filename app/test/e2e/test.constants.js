/* eslint-disable max-len */
const USERS = {
    USER: {
        id: '1a10d7c6e0a37126611fd7a5',
        role: 'USER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    MANAGER: {
        id: '1a10d7c6e0a37126611fd7a6',
        role: 'MANAGER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    ADMIN: {
        id: '1a10d7c6e0a37126611fd7a7',
        role: 'ADMIN',
        provider: 'local',
        email: 'user@control-tower.org',
        name: 'John Admin',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    RW_ADMIN: {
        id: '1a10d7c6e0a37123311fd7a7',
        role: 'ADMIN',
        provider: 'local',
        email: 'admin@control-tower.org',
        name: 'RW Admin',
        extraUserData: { apps: ['rw'] }
    },
    MICROSERVICE: {
        id: 'microservice'
    }
};

const ERRORS = {
    UPLOAD_EMPTY_FILE: '- dataset: file dataset can not be a empty file. - provider: provider must be in [csv,json,tsv,xml,tif,tiff,geo.tiff]. - dataset: file too large - dataset: file dataset is bad file type. - '
};

const BLOCKCHAIN_FAKE_INFO = {
    verified: true,
    blockchain: {
        id: '5857d1629e7cba66c3ea20a8',
        hash: '000dc75a315c77a1f9c98fb6247d03dd18ac52632d7dc6a9920261d8109b37cf'
    }
};

const STAMPERY_RESPONSE_OBJECT = {
    error: null,
    result: [
        {
            token: '64a52c59f71717e',
            id: BLOCKCHAIN_FAKE_INFO.blockchain.id,
            time: '2016-12-24 00:49:38.759000',
            hash: BLOCKCHAIN_FAKE_INFO.blockchain.hash,
            receipts: {
                btc: {
                    '@context': 'https://w3id.org/chainpoint/v2',
                    type: 'BTA-SHA256',
                    merkleRoot:
                        '8F1B7E8B6FBE3C49423E783B7B95DB3B2598643811A9C127D77AABE8BCF5C274',
                    proof: [
                        {
                            left:
                                '6AB48D00708B22D3833EA32C7C0D556989B9A4509F31779BC8BDC0DD094FB219'
                        },
                        {
                            right:
                                'BF5D1937D05F4CBB32E4287BF6C560BB176C44D2F59FB140AECD09B573E5119D'
                        }
                    ],
                    targetHash:
                        'A98E5C8103D2383A439CEFCAA493AD5A577708D66F6C0B594FACA2C7BC83975D',
                    anchors: [
                        {
                            prefix: '5336F7C1',
                            type: 'BTCTestnetOpReturn',
                            sourceId:
                                '1c9b593c5a8a0bf4dea2be23330fc4ba192e153aa9c3465cddb2a898ea932c44'
                        }
                    ]
                },
                eth: {
                    '@context': 'https://w3id.org/chainpoint/v2',
                    type: 'BTA-SHA256',
                    merkleRoot:
                        '27F6A3F86E32357DEAA9499520C01A230DBF6AA731A2958E8C0EBD4414CEF4ED',
                    proof: [
                        {
                            left:
                                '6AB48D00708B22D3833EA32C7C0D556989B9A4509F31779BC8BDC0DD094FB219'
                        }
                    ],
                    targetHash:
                        'A98E5C8103D2383A439CEFCAA493AD5A577708D66F6C0B594FACA2C7BC83975D',
                    anchors: [
                        {
                            prefix: '5336940F',
                            type: 'ETHTestnetData',
                            sourceId:
                                '0x6f2eb4a94920df4c0131b67483ba6282d9c6668069ea03afb073e8c68b609510'
                        }
                    ]
                }
            }
        }
    ]
};

module.exports = {
    USERS,
    STAMPERY_RESPONSE_OBJECT,
    BLOCKCHAIN_FAKE_INFO,
    ERRORS,
};
