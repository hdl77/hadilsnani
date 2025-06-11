// server/services/vrpSolver.js

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url'; // Required for __dirname equivalent in ES Modules

// __filename and __dirname are not directly available in ES Modules.
// This is the standard way to get them:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path to your Python script relative to this vrpSolver.js file
const pythonScriptPath = path.join(__dirname, '../python_solver/vrp_solver_script.py');

const callPythonVrpSolver = async (requestData) => {
    return new Promise((resolve, reject) => {
        console.log('[VrpSolver] Attempting to spawn Python script at:', pythonScriptPath);
        console.log('[VrpSolver] Data size to send to Python:', JSON.stringify(requestData).length, 'bytes');

        const pythonProcess = spawn('python', [pythonScriptPath]);

        let pythonOutput = '';
        let pythonError = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            // Log Python stderr to your Node.js console for debugging
            console.error('[VrpSolver] Python Stderr:', data.toString());
            pythonError += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                // If Python script exits with an error code, reject the promise
                return reject(new Error(`Python script exited with code ${code}. Error: ${pythonError}`));
            }
            try {
                // Parse the JSON output from the Python script
                const result = JSON.parse(pythonOutput);
                resolve(result);
            } catch (jsonError) {
                // If JSON parsing fails, reject with an error
                reject(new Error(`Failed to parse Python script output as JSON: ${jsonError.message}. Output: ${pythonOutput}`));
            }
        });

        // Write the request data as JSON to the Python script's stdin
        pythonProcess.stdin.write(JSON.stringify(requestData));
        pythonProcess.stdin.end(); // End the stdin stream
    });
};

// Export the function as 'solveVRP' to match the import statement in vrpRoutes.js
export { callPythonVrpSolver as solveVRP };