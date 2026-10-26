const { resolveSearchCatalog, normalizeAutomotiveQuery } = require('../lib/search-utils');

const testCases = [
  // Repuestos queries -> MUST go to /repuestos
  { query: 'radiador', expected: '/repuestos' },
  { query: 'radiador porsche', expected: '/repuestos' },
  { query: 'radiador porsche macan', expected: '/repuestos' },
  { query: 'foco', expected: '/repuestos' },
  { query: 'focos', expected: '/repuestos' },
  { query: 'focos delantero porsche', expected: '/repuestos' },
  { query: 'luneta', expected: '/repuestos' },
  { query: 'luneta porsche cayenne', expected: '/repuestos' },
  { query: 'amortiguador', expected: '/repuestos' },
  { query: 'suspension', expected: '/repuestos' },
  { query: 'fuelle', expected: '/repuestos' },
  { query: 'balon', expected: '/repuestos' },
  { query: 'compresor', expected: '/repuestos' },
  { query: 'pastillas', expected: '/repuestos' },
  { query: 'pastillas de freno', expected: '/repuestos' },
  { query: 'disco de freno', expected: '/repuestos' },
  { query: 'brazo suspension', expected: '/repuestos' },
  { query: 'macan', expected: '/repuestos' },
  { query: 'cayenne', expected: '/repuestos' },
  { query: 'boxster', expected: '/repuestos' },
  { query: 'cayman', expected: '/repuestos' },
  { query: '95B121251', expected: '/repuestos' },
  { query: '9P0945095B', expected: '/repuestos' },
  { query: 'porsche', expected: '/repuestos' },
  { query: 'audi', expected: '/repuestos' },
  { query: 'land rover', expected: '/repuestos' },

  // Aceites queries -> MUST go to /catalogo
  { query: 'aceite', expected: '/catalogo' },
  { query: 'aceite 5w30', expected: '/catalogo' },
  { query: 'aceite 5 30', expected: '/catalogo' },
  { query: 'acete 5w-30', expected: '/catalogo' },
  { query: '5w30', expected: '/catalogo' },
  { query: '5w-30', expected: '/catalogo' },
  { query: '5 30', expected: '/catalogo' },
  { query: '5w40', expected: '/catalogo' },
  { query: '0w20', expected: '/catalogo' },
  { query: '10w40', expected: '/catalogo' },
  { query: 'rowe', expected: '/catalogo' },
  { query: 'rowe 5w30', expected: '/catalogo' },
  { query: 'hightec', expected: '/catalogo' },
  { query: 'synt rs', expected: '/catalogo' },
  { query: 'multi formula', expected: '/catalogo' },
  { query: 'lubricante', expected: '/catalogo' },
  { query: 'lubricantes', expected: '/catalogo' },
  { query: 'aceite porsche', expected: '/catalogo' },
  { query: 'aceite bmw', expected: '/catalogo' },
  { query: '20118-0010-99', expected: '/catalogo' },
];

let failed = 0;
for (const tc of testCases) {
  const result = resolveSearchCatalog(tc.query);
  const pass = result.targetPath === tc.expected;
  if (!pass) {
    console.error(`❌ FAIL: "${tc.query}" -> got ${result.targetPath}, expected ${tc.expected}`);
    failed++;
  } else {
    console.log(`✅ PASS: "${tc.query}" -> ${result.targetPath} (clean: "${result.cleanQuery}")`);
  }
}

if (failed === 0) {
  console.log(`\n🎉 ALL ${testCases.length} TEST CASES PASSED PERFECTLY!`);
  process.exit(0);
} else {
  console.error(`\n💥 ${failed} test cases failed.`);
  process.exit(1);
}
