import http from "http";

const paths = [
  "/en/foods/grapes",
  "/en/plants/pothos",
  "/en/medications/ibuprofen",
  "/en/household-chemicals/bleach",
  "/en/pesticides/permethrin",
  "/en/categories/fruits",
  "/en/news",
  "/en/about",
  "/en/emergency",
  "/en/guides",
];

const results = [];

function check(path) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "localhost", port: 3000, path: `${path}?_rsc=ry-B8umWgNEV4JR9`, timeout: 5000 },
      (res) => {
        results.push(`${res.statusCode} ${path}`);
        res.resume();
        resolve();
      }
    );
    req.on("error", (e) => {
      results.push(`ERR ${path} ${e.message}`);
      resolve();
    });
    req.on("timeout", () => {
      req.destroy();
      results.push(`TIMEOUT ${path}`);
      resolve();
    });
  });
}

(async () => {
  await Promise.all(paths.map(check));
  console.log(results.join("\n"));
  process.exit(0);
})();
