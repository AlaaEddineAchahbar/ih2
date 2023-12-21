# Readme for ue-policy-mgmt-ui-module repository

## General Information

This repository holds the screen and frontend code for the Policies and Policy Templates.
It is being expanded to include both Enterprise and Property level (currently only Property level).

## Local Build

Current Angular version of this component is "`13`" and it uses node version "`16.10.0`".
To have the correct node verison active if you use nvm, open a terminal and type "`nvm use 16.10.0`".

To build the application open a terminal and change directory to the root folder (eg: "`cd c:\ihotelier\ue-policy-mgmt-ui-module`").
Then run the command "`npm install`". This will install the node modules it depends on. This will require connection to the TravelClick VPN.
Next run "`npm run build`". This will build the code.
To run the application do "`npm run start`".
Then navigate in a browser window to:

- Property Policies: "http://localhost:4200/#/policy-mgmt/property/search/policy/cancellation"
- Property Policy Templates: "http://localhost:4200/#/policy-mgmt/property/search/template/cancellation"
- Enterprise Deposit Configurations: "http://localhost:4200/#/policy-mgmt/enterprise/CYB/search/payment-deposit-rule" => replace CYB with the chain you want

If you are coding you can keep the application running. When you save your changes it will then be reflected in the running application.
![TravelClick](https://static-tx.travelclick.com/tc-images/logo/travelclick-logo-wide.png "TravelClick")
# Property Policy Management — Module (Part of Federated UI) -3.0.0 (Upgraded to Angular13)

### Current Version — **2.0.0**

> Clone this repo and it will provide boilerplate code for **Angular 13** application to speed up development.
> This is designed to make the life of developers easier.
>
> The boilerplate comes equipped with basic dependencies required for development.
>
> **First thing**
> Clone this repo by executing this command - **`git clone <repo path>`**
>
> Go and follow the Installation steps mentioned below
>
---

![npm](https://img.shields.io/badge/npm-1.0.0-0093E0.svg) ![Author](https://img.shields.io/badge/Author-TravelClick-blue.svg) [![License](https://img.shields.io/badge/License-Proprietary-FFBF69.svg)](LICENSE.md) ![Release Date](https://img.shields.io/badge/Release%20Date-2018%2F02%2F16-F38A00.svg) ![Build](https://img.shields.io/badge/Build-Passing-4CB944.svg) ![Status](https://img.shields.io/badge/Status-Stable-4CB944.svg) ![Issues](https://img.shields.io/badge/Issues-0-4CB944.svg) [![Modules](https://img.shields.io/badge/Modules-1-4CB944.svg)](http://cmstash.travelclick.net:7990/projects/COMMONS/repos/tc-angular-components/browse) [![Used by](https://img.shields.io/badge/Used%20by-2-4CB944.svg)](USAGE.md) ![Coverage](https://img.shields.io/badge/Test%20Coverage-93%25-FFB85A.svg)

### Pre-Requisites
[![node](https://img.shields.io/badge/node-%3E%3D%2016.10.0-4CB944.svg)](http://cmstash.travelclick.net:7990/projects/TOOL/repos/ue-angular-module-project-template/browse?at=initial-setup)


### Project structure
The folder structure plays a big part in the build process. The current default layout is as mentioned

```javacript
      <project-dir>/
        |- src/                                       //  Root of all Source files
        |  |- app/                                    //  Application level code
        |  |  |- app.*.*                              //  App source files
        |  |- assets-policy-mgmt/                              //  Assets related to project
        |  |- modules/                                //  Actual app code to be exported as module
        |  |  |- components/                          //  Components to be exported in app module
        |  |- main.ts                                 //  Application bootstrap
        |  |- public_api.ts                           //  Exports for all modules
        |  |- index.html                              //  Application index
        |  |- styles.css                              //  Application CSS imports
        |  |- tsconfig.app.json                       //  App level TypeScript configurations
        |- .angular-cli.json                          //  Angular app level compiler configuration settings
        |- .editorconfig                              //  Editor config rules
        |- .npmrc                                     //  npmrc file with TravelClick repo details. You should be connected to TravelClick VPN
        |- package.json                               //  npm package dependencies
        |- ng-package.json                            //  Library package config
        |- README.md                                  //  Application Readme instructions
        |- CONTRIBUTING.md                            //  Contribution instructions
        |- CHANGELOG.md                               //  Changelog file to cater future changes
        |- tsconfig.json                              //  Global Typescript config
        |- eslintrc.json                                //  Typescript lint rules
        |- karma.conf.js                              //  Karma configurations
        |- Jenkinsfile                                //  Jenkins command for various stages
```

## Dependencies

- [@angular/animations](https://ghub.io/@angular/animations): Angular - animations integration with web-animations
- [@angular/common](https://ghub.io/@angular/common): Angular - commonly needed directives and services
- [@angular/compiler](https://ghub.io/@angular/compiler): Angular - the compiler library
- [@angular/core](https://ghub.io/@angular/core): Angular - the core framework
- [@angular/forms](https://ghub.io/@angular/forms): Angular - directives and services for creating forms
- [@angular/http](https://ghub.io/@angular/http): Angular - the http service
- [@angular/platform-browser](https://ghub.io/@angular/platform-browser): Angular - library for using Angular in a web browser
- [@angular/platform-browser-dynamic](https://ghub.io/@angular/platform-browser-dynamic): Angular - library for using Angular in a web browser with JIT compilation
- [@angular/router](https://ghub.io/@angular/router): Angular - the routing library
- [rxjs](https://ghub.io/rxjs): Reactive Extensions for modern JavaScript
- [svgxuse](https://ghub.io/svgxuse): A polyfill that fetches external SVGs referenced in use elements when the browser itself fails to do so.
- [zone.js](https://ghub.io/zone.js): Zones for JavaScript
- [@auth0/angular-jwt](https://github.com/auth0/angular2-jwt): JSON Web Token helper library for Angular
- [@ngx-translate/core]: The internationalization (i18n) library for Angular
- [@ngx-translate/http-loader](https://github.com/ngx-translate/core): A loader for ngx-translate that loads translations using http
- [tslib](https://github.com/Microsoft/tslib): Runtime library for TypeScript helper functions
- [font-awesome](https://github.com/FortAwesome/Font-Awesome): Font Awesome is the Internet's icon library and toolkit.
- [lodash](https://github.com/lodash/lodash): A modern JavaScript utility library delivering modularity, performance, & extras.
- [moment](https://github.com/moment/moment): A JavaScript date library for parsing, validating, manipulating, and formatting dates.
- [primeng](https://ghub.io/primeng): [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Join the chat at https://gitter.im/primefaces/primeng](https://badges.gitter.im/primefaces/primeng.svg)](https://gitter.im/primefaces/primeng?utm_source=badge&amp;utm_medium=badge&amp;utm_campaign=pr-badge&amp;utm_content=badge)
- [primeicons](https://github.com/primefaces/primeicons): Font Icon Library for Prime UI Libraries.
- [@angular-architects/module-federation](https://github.com/angular-architects/module-federation-plugin) - Module Federation allows loading separately compiled and deployed code (like micro frontends or plugins) into an application. This plugin makes Module Federation work together with Angular and the CLI.
- [**tc-angular-components**](https://ghub.io/tc-angular-components): Angular (Version 13) Components
- [**tc-angular-services**](https://ghub.io/tc-angular-services): Angular (Version 13) Services
- [**tc-styles**](https://ghub.io/tc-styles): TravelClick Global Styles which can be used by Angular projects. The current version is developed over Bootstrap 5.0.0.
- [**tc-comp-services**](https://ghub.io/tc-comp-services): Services included for handling http requests, caching data, handling interceptor, events, initialization and environment configurations.

## Dev Dependencies

- [@angular/cli](https://ghub.io/@angular/cli): CLI tool for Angular
- [@angular/compiler-cli](https://ghub.io/@angular/compiler-cli): Angular - the compiler CLI for Node.js
- [@angular/language-service](https://ghub.io/@angular/language-service): Angular - language services
- [@compodoc/compodoc](https://ghub.io/@compodoc/compodoc): The missing documentation tool for your Angular application
- [@ng-bootstrap/ng-bootstrap](https://ghub.io/@ng-bootstrap/ng-bootstrap): Angular powered Bootstrap
- [@types/jasmine](https://ghub.io/@types/jasmine): TypeScript definitions for Jasmine
- [@types/jasminewd2](https://ghub.io/@types/jasminewd2): TypeScript definitions for jasminewd2
- [@types/node](https://ghub.io/@types/node): TypeScript definitions for Node.js
- [bootstrap](https://ghub.io/bootstrap): The most popular front-end framework for developing responsive, mobile first projects on the web.
- [jasmine-core](https://ghub.io/jasmine-core): Official packaging of Jasmine&#39;s core files for use by Node.js projects.
- [jasmine-spec-reporter](https://ghub.io/jasmine-spec-reporter): Spec reporter for jasmine behavior-driven development framework
- [karma](https://ghub.io/karma): Spectacular Test Runner for JavaScript.
- [karma-chrome-launcher](https://ghub.io/karma-chrome-launcher): A Karma plugin. Launcher for Chrome and Chrome Canary.
- [karma-jasmine](https://ghub.io/karma-jasmine): A Karma plugin - adapter for Jasmine testing framework.
- [karma-jasmine-html-reporter](https://ghub.io/karma-jasmine-html-reporter): A Karma plugin. Dynamically displays tests results at debug.html page
- [tslint](https://ghub.io/tslint): An extensible static analysis linter for the TypeScript language
- [typescript](https://ghub.io/typescript): TypeScript is a language for application scale JavaScript development
- [@angular-devkit/build-angular](https://ghub.io/@angular-devkit/build-angular): Angular Webpack Build Facade
- [@angular-eslint/builder](https://ghub.io/@angular-eslint/builder): Angular CLI builder for ESLint
- [@angular-eslint/eslint-plugin](https://ghub.io/@angular-eslint/eslint-plugin): ESLint plugin for Angular applications, following angular.io/styleguide
- [@angular-eslint/eslint-plugin-template](https://ghub.io/@angular-eslint/eslint-plugin-template): ESLint plugin for Angular Templates
- [@angular-eslint/schematics](https://ghub.io/@angular-eslint/schematics): Angular Schematics for angular-eslint
- [@angular-eslint/template-parser](https://ghub.io/@angular-eslint/template-parser): Angular Template parser for ESLint
- [@angular/localize](https://ghub.io/@angular/localize): Angular - library for localizing messages
- [@typescript-eslint/eslint-plugin](https://ghub.io/@typescript-eslint/eslint-plugin): TypeScript plugin for ESLint
- [@typescript-eslint/parser](https://ghub.io/@typescript-eslint/parser): An ESLint custom parser which leverages TypeScript ESTree
- [eslint](https://ghub.io/eslint): An AST-based pattern checker for JavaScript.
- [karma-coverage](https://ghub.io/karma-coverage): A Karma plugin. Generate code coverage.
- [ts-node](https://ghub.io/ts-node): TypeScript execution environment and REPL for node.js, with source map support
- [@cypress/schematic](https://ghub.io/@cypress/schematic): Official Cypress schematic for the Angular CLI
- [cypress](https://ghub.io/cypress): Cypress.io end to end testing tool
- [mocha](https://ghub.io/mocha): simple, flexible, fun test framework
- [mochawesome](https://ghub.io/mochawesome): A gorgeous reporter for Mocha.js
- [mochawesome-merge](https://ghub.io/mochawesome-merge): Merge several Mochawesome JSON reports
- [ngx-build-plus](https://github.com/manfredsteyer/ngx-build-plus): Extend the Angular CLI's default build behavior.

### Installation
1. Install dependencies
    ```javascript
        npm install
    ```


### Development
**`tc-angular-component`** and **`tc-styles`** are already included in boilerplate project, please follow below steps before you start development:
1. Modify **`name`** and **`repository.url`** value in package.json file, to reference your project.
2. Modify value for **`directive-selector`** and **`component-selector`** in **`tslint.json`** file. Replace **`tc`** with your project prefix.
3. Rename all file names prefix as per project. Example- **`template-project.module.ts`** will become **`<your-project-name>.module.ts`**. Don't forget to modify any import reference for the modified files.
4. Rename all classes. Example- **`TemplateProjectComponent`** and **`TemplateProjectModule`** will become **`<your-project-name>Component`** and **`<your-project>Module`**.
5. Rename assets folder from **`assets-tc`** to **`assets-<your-project-name>`**. Also modify reference in **`.angular-cli.json`**.

### Run
1. Run bellow command in **`Terminal / command prompt`**:
    ```javascript
        npm start
    ```

### Development server
>*Navigate to ***`http://localhost:4200`*** to launch the application.*
>
>The app will automatically reload if you change any of the source files.
>

### Test
1. Run test with below command, It will generate test results in **`karma_html`** directory
    ```javascript
        npm run test
    ```
2. Run test with headless browser
    ```javascript
        npm run test -- --browsers ChromeHeadless
    ```
3. Generate test coverage at **`./coverage`** directory
    ```javascript
        npm run coverage
    ```

### Lint
1. Run **`npm run lint`** to execute the lint task to verify code standards

### MFE Implementation
1. Run below command on command prompt:
```javascript
    npm run ng add @angular-architects/module-federation@14.2.0
```
2. This will update some existing files (angular.json, main.ts etc.) and will apply the module-federation related changes for the UE module via creating new webpack file.

### Build
1. Run below commands
    ```javascript
        1. npm install
        2. npm run build
    ```
2. It will generate build at **`./dist`** folder.


### Documentation
1. Run **`npm run compodoc`** to generate complete code level api documentation
2. It will generate live api documentation in **`./documentation`** directory

### Features and Advantages
>- **Easy setup** process for any new project
>- **Consistency** across projects (the structure)
>- **Documentation** support in built
>- **Code coverage** support integrated
>- **Linting** rules all specified and tested
>- TravelClick **packages** included with usage example

### Projects utilizing Angular 13 Boilerplate
[List of Projects](USAGE.md)

### Want to help/contribute?
To contribute towards Boilerplate development please checkout [CONTRIBUTING](CONTRIBUTING.md) section

### License
[License](LICENSE.md)
