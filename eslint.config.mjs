import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    rules: {
      "prefer-const": "error",
    },
  },
];

export default eslintConfig;
