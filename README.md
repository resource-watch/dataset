# Dataset microservice

[![Build Status](https://travis-ci.org/resource-watch/dataset.svg?branch=develop)](https://travis-ci.org/resource-watch/dataset)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6e90d8ae68d28c916a5c/test_coverage)](https://codeclimate.com/github/resource-watch/dataset/test_coverage)

## Dependencies

You will need [Control Tower](https://github.com/control-tower/control-tower) up and running - either natively or with Docker. Refer to the project's README for information on how to set it up.

The Dataset microservice is built using [Node.js](https://nodejs.org/en/), and can be executed either natively or using Docker, each of which has its own set of requirements.

Native execution requires:
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/resource-watch/dataset.git && cd dataset
```

After that, follow one of the instructions below:

### Using native execution

1 - Set up your environment variables. See `dev.env.sample` for a list of variables you should set, which are described in detail in [this section](#environment-variables) of the documentation. Native execution will NOT load the `dev.env` file content, so you need to use another way to define those values

2 - Install node dependencies using yarn:
```
yarn
```

3 - Start the application server:
```
yarn start
```

The endpoints provided by this microservice should now be available through Control Tower's URL.

### Using Docker

1 - Create and complete your `dev.env` file with your configuration. The meaning of the variables is available in this [section](#configuration-environment-variables). You can find an example `dev.env.sample` file in the project root.

2 - Execute the following command to run Control tower:

```
./dataset.sh develop
```

The endpoints provided by this microservice should now be available through Control Tower's URL.

## Testing

There are two ways to run the included tests:

### Using native execution

Follow the instruction above for setting up the runtime environment for native execution, then run:
```
yarn test
```

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:
```
./dataset.sh test
```

## Configuration

### Environment variables

- PORT => TCP port in which the service will run
- NODE_PATH => relative path to the source code. Should be `app/src`
- CT_REGISTER_MODE => if `auto` the microservice automatically registers on Control Tower on start
- CT_TOKEN => 
- API_VERSION => API version identifier that prefixes the URL. Should be `v1`
- S3_ACCESS_KEY_ID => AWS S3 key id
- S3_SECRET_ACCESS_KEY => AWS S3 access key
- MONGO_PORT_27017_TCP_ADDR => IP/Address of the MongoDB server

You can optionally set other variables, see [this file](config/custom-environment-variables.json) for an extended list.

## Documentation

### Dataset model

| Property Name           	| Value         	| Description                                	| Required 	| Notes                                                                                                                                                             	|
|-------------------------	|---------------	|--------------------------------------------	|----------	|-------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| name                    	| string        	| A name of the dataset                      	| Yes      	|                                                                                                                                                                   	|
| slug                    	| string        	| Slug-like string of the dataset name       	| No       	| Autogenerated                                                                                                                                                     	|
| type                    	| string        	| The type of the dataset                    	| No       	|                                                                                                                                                                   	|
| application             	| string        	| The application the dataset belongs to     	| No       	| Autogenerated                                                                                                                                                     	|
| dataPath                	| string        	| Path of the data in document datasets      	| No       	|                                                                                                                                                                   	|
| attributesPath          	| string        	| Attributes to import                       	| No       	|                                                                                                                                                                   	|
| connectorType           	| string        	| The type of connector of the dataset       	| Yes      	| Valid connectorTypes values ["rest", "document", "wms"]                                                                                                           	|
| provider                	| string        	| The dataset connector provider             	| Yes      	| Valid provider values: rest -> ["cartodb", "featureservice", "gee", "bigquery", "rasdaman", "nexgddp"]; document -> ["csv", "json", "tsv", "xml"]; wms -> ["wms"] 	|
| userId                  	| string        	| The userId of the owner of the dataset     	| No       	|                                                                                                                                                                   	|
| connectorUrl            	| string        	| A valid url where the data is stored       	| No       	| Required when the dataset connectorType is rest.                                                                                                                  	|
| tableName               	| string        	| The name of the actual or generated table. 	| No       	| Autogenerated                                                                                                                                                     	|
| status                  	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| overwrite               	| boolean       	|                                            	| No       	|                                                                                                                                                                   	|
| errorMessage            	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| published               	| boolean       	|                                            	| No       	|                                                                                                                                                                   	|
| sandbox                 	| boolean       	|                                            	| No       	|                                                                                                                                                                   	|
| env                     	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| geoInfo                 	| boolean       	|                                            	| No       	|                                                                                                                                                                   	|
| protected               	| boolean       	|                                            	| No       	|                                                                                                                                                                   	|
| taskId                  	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| subscribable            	| nested object 	|                                            	| No       	|                                                                                                                                                                   	|
| legend                  	| nested object 	|                                            	|          	|                                                                                                                                                                   	|
| legend.lat              	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| legend.long             	| string        	|                                            	| No       	|                                                                                                                                                                   	|
| legend.date             	| list          	|                                            	| No       	| List of string values                                                                                                                                             	|
| legend.region           	| list          	|                                            	| No       	| List of string values                                                                                                                                             	|
| legend.country          	| list          	|                                            	| No       	| List of string values                                                                                                                                             	|
| legend.nested           	| list          	|                                            	| No       	| List of string values                                                                                                                                             	|
| clonedHost              	| nested object 	|                                            	|          	|                                                                                                                                                                   	|
| clonedHost.hostProvider 	| string        	|                                            	| No       	| Autogenerated                                                                                                                                                     	|
| clonedHost.hostUrl      	| string        	|                                            	| No       	| Autogenerated                                                                                                                                                     	|
| clonedHost.hostId       	| string        	|                                            	| No       	| Autogenerated                                                                                                                                                     	|
| clonedHost.hostType     	| string        	|                                            	| No       	| Autogenerated                                                                                                                                                     	|
| clonedHost.hostPath     	| string        	|                                            	| No       	| Autogenerated                                                                                                                                                     	|
| createdAt               	| string        	|                                            	| No       	| Date value                                                                                                                                                        	|
| updatedAt               	| string        	|                                            	| No       	| Date Value                                                                                                                                                        	|

### Dataset Endpoints

GET: /v1/dataset

POST: /v1/dataset

GET: /v1/dataset/:dataset

PATCH: /v1/dataset/:dataset

DELETE: /v1/dataset/:dataset

POST: /v1/dataset/find-by-ids

POST: /v1/dataset/upload

GET: /v1/dataset/:dataset/clone

### Swagger

[Check out the swagger docs](https://editor.swagger.io/?url=https://raw.githubusercontent.com/GPSDD/dataset/develop/app/microservice/swagger.json)

### Legacy

At some point, we had a blockhain validation functionality. As it was not used, and for code simplicity, it was removed here:  https://github.com/resource-watch/dataset/pull/97
Use that link to restore it if needed.
