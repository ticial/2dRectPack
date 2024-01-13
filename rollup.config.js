import typescript from "rollup-plugin-typescript";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/js/bundle.js",
    format: "umd",
    name: "projectbundle",
    sourcemap: true
  },
  plugins: [
    typescript(),
    json(),
    copy({
      targets: ["src/www/index.html", "src/www/style.css"],
      outputFolder: "dist"
    })
  ]
};
