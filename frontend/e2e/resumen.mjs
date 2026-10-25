import { appendFileSync, readFileSync } from 'node:fs'

const { stats, errors = [] } = JSON.parse(readFileSync('test-results/resumen.json', 'utf8'))
const { expected, unexpected, flaky, skipped } = stats
const passed = expected + flaky
const resumen = `### Playwright: ${process.argv[2]}\n\n${passed} passed · ${unexpected} failed · ${skipped} skipped · ${flaky} flaky\n\n`
console.log(resumen)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen)
// Evita un verde si se retiraron pruebas o se dejaron salteadas.
if (passed < 3 || unexpected > 0 || skipped > 0 || errors.length > 0) process.exitCode = 1
