# 21/03/2020

- Fix issue where deleting wms datasets would fail

# 20/03/2020

- Remove blockchain and verified fields and associated blockchain signature logic.
- Fix issue where dataset upload would fail.

# 17/03/2020

- Add support for nested filters in applicationConfig object.
- Fix issue with sorting for ascending order.

# 09/03/2020

- Remove `usersRole` query param which generated huge pagination links.

# 27/01/2020

- Add possibility of sorting datasets by user fields (such as name or role).
- Fix bug patching dataset without changing dataset apps.

# v1.0.0

## 14/01/2020

- Add filter for querying subscribable datasets.
- Fix bug removing dataset applications by admins who can manage the removed applications.

# Previous

- Allow microservices to update the dataset's `errorMessage` field.
