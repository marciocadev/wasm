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

  const { using_add, get_str_from_using_add, receive_strings } = wasmModule.instance.exports;
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

  if (typeof receive_strings === "function") {
    const memory = wasmModule.instance.exports.memory as WebAssembly.Memory;
    const encoder = new TextEncoder();

    // Helper to write a string into WASM memory and return its pointer
    function writeStringToMemory(str: string, offset: number): number {
      const encoded = encoder.encode(str + "\0"); // null-terminated
      const buffer = new Uint8Array(memory.buffer);
      buffer.set(encoded, offset);
      return offset;
    }

    // Allocate space in memory (naive approach: fixed offsets)
    const str1Ptr = writeStringToMemory("teste", 100);
    const str2Ptr = writeStringToMemory("123", 200);

    // Call the function with pointers
    const resultPtr = receive_strings(str1Ptr, str2Ptr);

    // Read result string from memory
    const buffer = new Uint8Array(memory.buffer);
    let str = "";
    for (let i = resultPtr; buffer[i] !== 0; i++) {
      str += String.fromCharCode(buffer[i]);
    }

    console.log("receive_strings('teste','123') =>", str);
  }
}

main();
