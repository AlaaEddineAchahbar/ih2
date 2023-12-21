const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;
const deps = require('./package.json').dependencies;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "ue-policy-mgmt-ui-module",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },   
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({

        // For remotes (we provide path of base module of UE module)

        library: { type: "module" },
        name: "ue-policy-mgmt-ui-module",
        filename: "remoteEntry.js",
        exposes: {
            'PolicyMgmtUIModule': './/src/modules/policy-mgmt.module.ts',    // exposed module name : base module path
        },


        // We can define shared angular dependencies (required) as well as other dependencies (optional) using the following options. These options enable us to load angular   
        //dependencies only once, ensuring versioning consistency.          

        shared: share({
          "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/platform-browser": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "rxjs": { singleton: true, strictVersion: true, requiredVersion: deps.rxjs },
          "bootstrap": { singleton: true, strictVersion: true, requiredVersion: deps.bootstrap },
          /**
          * Tc-dependecies should not have strictVersion as true and requiredVersion as auto
          * So that these dependencies take the latest version defined in shell(ue-comp-ui)
          */
          "tc-angular-services": { singleton: true },
          "tc-styles": { singleton: true },
          "tc-angular-components": { singleton: true },
          ...sharedMappings.getDescriptors()
        })

    }),
    sharedMappings.getPlugin()
],
};
