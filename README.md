# OpenAPI Schema Generator for the Lemmy JS Client Library
## Overview
This is a simple script which converts the [Lemmy JS client](https://github.com/LemmyNet/lemmy-js-client) source files into an OpenAPI 3.0 Json specification.

The generated OpenAPI schema can be used by the [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) to generate a client SDK in any supported language/framework.

## Usage
1. Clone the [Lemmy JS client](https://github.com/LemmyNet/lemmy-js-client) repository somewhere on disk
2. From the `lemmy-ts-openapi` root, run the following command to parse the JS library and generate an OpenAPI schema file:
```sh
npm start -- -c /path/to/lemmy-js-client -o /path/to/output/filename.json
```

## Contributing
Contributions are welcome! I am not a Typescript developer by trade, and there is likely a lot of room for improvement.

