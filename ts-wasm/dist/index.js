"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const node_wasi_1 = require("node:wasi");
const process_1 = require("process");
const wasi = new node_wasi_1.WASI({
    version: "preview1",
    args: process_1.argv,
    env: process_1.env,
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
        const memory = wasmModule.instance.exports.memory;
        const buffer = new Uint8Array(memory.buffer, get_str_from_using_add(1, 2));
        let str = "";
        for (let i = 0; buffer[i] !== 0; i++) {
            str += String.fromCharCode(buffer[i]);
        }
        console.log("get_str_from_using_add(1,2) =>", str);
    }
    if (typeof receive_strings === "function") {
        const memory = wasmModule.instance.exports.memory;
        const encoder = new TextEncoder();
        // const decoder = new TextDecoder();
        // Helper to write a string into WASM memory and return its pointer
        function writeStringToMemory(str, offset) {
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
};
main();
//# sourceMappingURL=index.js.map