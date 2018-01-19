module.exports = function PostGraphileConnectionMultiTenantPlugin (builder, options)
{  
  require ('./src/ConnectionMultiTenantPlugin.js')(builder, options)
}
