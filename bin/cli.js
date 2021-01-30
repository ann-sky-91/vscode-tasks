#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const cwd = process.cwd()

const exclude = ['node_modules', '.git']

const tasksConfig = {
    version: '2.0.0',
    tasks: [],
}

const modulePath = process.argv[2]

if (modulePath) {
    setModuleTasks(modulePath)
} else {
    setTasks()
}

if (!fs.existsSync('.vscode')) {
    fs.mkdirSync('.vscode')
}
fs.writeFileSync('.vscode/tasks.json', JSON.stringify(tasksConfig))

function setModuleTasks(modulePath) {
    const module = getModule(modulePath)
    const moduleDir = path.dirname(modulePath)
    Object.keys(module.scripts).forEach(script => {
        tasksConfig.tasks.push({
            type: 'npm',
            script,
            label: moduleDir === '' ? script : `${script} - ${moduleDir}`,
            path: `${moduleDir}/`,
            detail: module.scripts[script],
            group: 'build',
        })
    })
    tasksConfig.tasks.push({
        type: 'shell',
        label: '<-',
        command: `vscode-tasks`,
        group: 'build',
    })
}

function setTasks() {
    const modules = getModulesList().map(module => path.relative(cwd, module))
    modules.forEach(modulePath => {
        const module = getModule(modulePath)
        tasksConfig.tasks.push({
            type: 'shell',
            label: module.name,
            command: `vscode-tasks "${modulePath}"`,
            group: 'build',
        })
    })
}

function getModule(modulePath) {
    return JSON.parse(fs.readFileSync(modulePath).toString())
}

function getModulesList() {
    const results = []
    walk(cwd)
    return results

    function walk(dir) {
        // console.log('walk', dir)
        fs.readdirSync(dir).forEach(file => {
            if (exclude.includes(file)) {
                return
            }
            // console.log('file', file)
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                walk(filePath)
            } else if (file === 'package.json') {
                results.push(filePath)
            }
        })
    }
}
