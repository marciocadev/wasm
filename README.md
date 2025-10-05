# WASM

## Start wasm directory
```sh
pnpm init
mkdir dist
```

## Start rust-lib directory
```sh
cargo init rust-lib --lib
cd rust-lib
pnpm init
```
#### Update `package.json`
```json
{
  "name": "rust-lib",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rm -rf ./target && cargo build --target wasm32-wasip1 --release"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.18.0"
}
```
#### Build the lib
```sh
npm run build
```

## Start rust-wasm-lib directory
```sh
cargo init rust-wasm-lib --lib
cd rust-wasm-lib
pnpm init
cargo add rust-lib --path ../rust-lib
```
#### Update `Cargo.toml`
```toml
[package]
name = "rust-wasm-lib"
version = "0.1.0"
edition = "2021"

[dependencies]
rust-lib = { version = "0.1.0", path = "../rust-lib" }

[lib]
crate-type = ["rlib", "cdylib"]
```
#### Update `lib.rs`
```rs
use rust_lib::add;

#[no_mangle]
pub unsafe extern "C" fn using_add(left: u64, right: u64) -> u64 {
    add(left, right)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = unsafe { using_add(2, 2) };
        assert_eq!(result, 4);
    }
}
```
#### Update `package.json`
```json
{
  "name": "rust-wasm-lib",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rm -rf ./target && cargo build --target wasm32-wasip1 --release && cp ./target/wasm32-wasip1/release/rust_wasm_lib.wasm ../dist"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.18.0"
}
```
Build the wasm lib
```sh
npm run build
```
## Start ts-wasm directory
```sh
mkdir ts-wasm
pnpm init
npx tsc --init
mkdir src
```
#### Update `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": [
      "es2020",
      "dom"
    ],
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "baseUrl": ".",
    "esModuleInterop": true,
    "skipLibCheck": true,
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
#### Create the `index.ts` inside the folder `src`
```ts
import * as fs from "fs";
import { WASI } from "node:wasi";
import { argv, env } from "process";

const wasi = new WASI({
  version: "preview1",
  args: argv,
  env,
  preopens: {
    "/": "./"
  }
});

async main() {

}
```