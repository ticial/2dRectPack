import typescript from "rollup-plugin-typescript";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

module.exports = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "cjs",
    name: "projectbundle",
    sourcemap: true
  },
  plugins: [
    typescript(),
    json({
      preferConst: true
    }),
    copy({
      targets: ["src/www/index.html", "src/www/style.css", "src/blocksData.json"],
      outputFolder: "dist"
    })
  ]
};
