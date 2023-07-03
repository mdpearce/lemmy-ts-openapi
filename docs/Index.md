# Lemmy OpenAPI generator

## Overview
Since Lemmy provides bo official API spec apart from the JS/TS client SDk, it was necessary to generate an OpenAPI schema based on the JS client.

This allows us to use the openapi-generators to create a Lemmy client SDK in almost any conceivable language or framework.

## Running the generator
1. install npm
2. run `npm install` from the `lemmy-ts-openapi` root directory
3. clone the lemmy js sdk somewhere on disk
4. execute `npm start -- -c /path/to/js-client -o openapi-lemmy.json`
5. run your desired openapi-generator to generate a complete client SDK in your desired language

## Contributions
Contributions are welcome!
