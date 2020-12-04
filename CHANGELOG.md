## 04/12/2020

- Replace CT integration library

# v1.3.3

## 17/11/2020

- Security update of NPM package `lodash` from 4.17.15 to 4.17.20.
- Security update of NPM package `yargs-parser` from 13.1.1 to 13.1.2.
- Security update of NPM package `bl` from 2.2.0 to 2.2.1.

# v1.3.2

## 13/07/2020

- Minor logging improvements.
- Security updates to the `handlebars` and `websocket-extensions` NPM packages.

# v1.3.1

## 19/05/2020

- Use secondary mongo nodes for read operations.
- Disable mongo unified topology.

# v1.3.0

## 09/04/2020

- Add node affinity to kubernetes configuration.

## 24/03/2020

- Remove blockchain and verified fields and associated blockchain signature logic.

# v1.2.0

## 23/03/2020

- Fix issue where deleting wms datasets would fail
- Fix issue where dataset upload would fail.
- Add support for nested filters in applicationConfig object.
- Fix issue with sorting for ascending order.
- Remove `usersRole` query param which generated huge pagination links.

# v1.1.0

## 27/01/2020

- Add possibility of sorting datasets by user fields (such as name or role).
- Fix bug patching dataset without changing dataset apps.

# v1.0.0

## 14/01/2020

- Add filter for querying subscribable datasets.
- Fix bug removing dataset applications by admins who can manage the removed applications.

# Previous

- Allow microservices to update the dataset's `errorMessage` field.
