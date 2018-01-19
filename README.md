# postgraphile-plugin-connection-multi-tenant
Filtering Connections in PostGraphile by Tenants

## Disclaimer & Compatibility

This plugin still in very alpha version. It targets the alpha release of PostGraphile v4.

Bug reports and pull requests are very much welcome.

## Multi Tenant Database

The main drawback of Multi Tenant with **shared-tables** is the need to append the tenant filter condition onto every single query in the application layer.
One possible way to isolate tenants is to add `tenant_id` to every table, and scope every request with that field.

This plugin will filter tables (Connections) by looking for table with column name specified by `tenantColumnName` at graphileBuildOptions.

Currently, the collections will be filtered by using `tenant_id` (stored in jwt).

Add the `tenant_id` in your schema, i.e :
```
create type store_example.jwt_token as (
  tenant_id text
  role text,
  person_id integer
);
```


## TODO
- optional tables autofilter by `connectionMultiTenantAllowedTables` graphileBuildOptions.
- add test

## Usage

### CLI

``` bash
postgraphile --append-plugins `pwd`/path/to/this/plugin/index.js
```


### Library

``` js
const express = require("express");
const { postgraphile } = require("postgraphile");
const PostGraphileConnectionMultiTenantPlugin = require("postgraphile-plugin-connection-multi-tenant");

const app = express();

app.use(
  postgraphile(pgConfig, schema, {
    graphiql: true,
    appendPlugins: [PostGraphileConnectionMultiTenantPlugin],
  })
);

app.listen(5000);
```

## Plugin Options

When using PostGraphile as a library, the following plugin options can be passed via `graphileBuildOptions` (called `graphqlBuildOptions` in PostGraphile 4.0.0-alpha2.20 and earlier):

### tenantColumnName
Target column :
``` js
postgraphile(pgConfig, schema, {
  ...
  graphileBuildOptions: {
    tenantColumnName: 'tenantId',
  },
})
```
