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

const main = async () => {
  const wasmBuffer = fs.readFileSync("../dist/rust_wasm_lib.wasm");
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
    wasi_snapshot_preview1: wasi.wasiImport
  });
  console.log("rust_wasm_lib exports:", Object.keys(wasmModule.instance.exports));

  const { using_add, get_str_from_using_add } = wasmModule.instance.exports;
  if (typeof using_add === "function") {
    console.log("using_add(1,1) =", using_add(1, 1));
  }

  if (typeof get_str_from_using_add === "function") {
    const memory = wasmModule.instance.exports.memory as WebAssembly.Memory;
    const buffer = new Uint8Array(memory.buffer, get_str_from_using_add(1, 2));
    let str = "";
    for (let i = 0; buffer[i] !== 0; i++) {
      str += String.fromCharCode(buffer[i]);
    }
    console.log("get_str_from_using_add(1,2) =>", str);
  }
}

main();
