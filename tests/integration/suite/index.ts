/**
 * Test suite entry point for VSCode integration tests
 * This file runs INSIDE the VSCode extension host process
 */

import {glob} from 'glob'
import Mocha from 'mocha'
import * as path from 'path'

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 60000, // 60s timeout for integration tests
	})

	const testsRoot = path.resolve(__dirname, '..')

	try {
		// Find all test files
		const files = await glob('**/**.test.js', {cwd: testsRoot})

		// Add files to the test suite
		files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

		// Run the mocha test
		return new Promise((resolve, reject) => {
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`))
				} else {
					resolve()
				}
			})
		})
	} catch (err) {
		console.error(err)
		throw err
	}
}
