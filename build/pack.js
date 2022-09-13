const { execSync } = require('child_process')
const fs = require('fs')

process.chdir('dist')
try {
  try {
    const result = execSync('npm pack', null, { stdio: 'inherit', timeout: 10000 })
    console.log(String(result))
  } catch (error) {
    if (typeof error === 'number') {
      throw new Error(`Subprocess exited with a status code of ${error.status}`)
    }
    throw error
  }
  const packageJson = JSON.parse(fs.readFileSync('package.json'))
  const packageFileName = `${packageJson.name.replace(/@/g, '').replace(/\//g, '-')}-${packageJson.version}.tgz`
  fs.renameSync(`./${packageFileName}`, `../${packageFileName}`)
} finally {
  process.chdir('..')
}
