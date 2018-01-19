module.exports = function ConnectionMultiTenantPlugin (
  builder,
  {
    tenantColumnName,
    pgInflection: inflection,
  } = {},
) {
  builder.hook('GraphQLObjectType:fields:field:args',
    (args, build, context) => {
      const {
        pgSql: sql,
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        pgColumnFilter,
        graphql: {
          GraphQLObjectType,
        },
      } = build
      const {
        field,
        scope: { pgFieldIntrospection: table, isRootQuery },
        addArgDataGenerator,
      } = context

      if (isRootQuery &&
          field.type instanceof GraphQLObjectType &&
          table.classKind === 'r'
      ) {
        const attrByFieldName = introspectionResultsByKind.attribute
          .filter(attr => attr.classId === table.id)
          .filter(attr => pgColumnFilter(attr, build, context))
          .reduce((memo, attr) => {
            const fieldName = inflection.column(
              attr.name,
              table.name,
              table.namespace && table.namespace.name,
            )
            memo[fieldName] = attr
            return memo
          }, {})

        const tenantAttr = attrByFieldName[tenantColumnName]
        if (tenantAttr) {
          field.description += ' [Limited] by Tenant.'
          addArgDataGenerator(
            () => ({
              pgQuery: queryBuilder => {
                function resolveWhereComparison () {
                  const identifier = sql.query`${queryBuilder.getTableAlias()}.${sql.identifier(
                    tenantAttr.name)}`
                  const val = sql.query`current_setting('jwt.claims.tenant_id')::uuid`
                  return sql.query`${identifier} = ${val}`
                }
                queryBuilder.where(resolveWhereComparison())
              },
            }),
          )
        }
      }
      return args
    },
  )
}
