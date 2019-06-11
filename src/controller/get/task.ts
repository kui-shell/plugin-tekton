/*
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CodedError } from '@kui-shell/core/models/errors'
import { CommandRegistrar, IEvaluatorArgs } from '@kui-shell/core/models/command'

import { fetchTask } from '../../lib/read'

const usage = (command: string) => ({
  command,
  strict: command,
  required: [
    { name: 'pipelineName', docs: 'Name of the pipeline' }
  ],
  optional: [
    { name: 'taskName', docs: 'Name of the task', positional: true },
    { name: '--file', alias: '-f', docs: 'Path to resource specification' }
  ]
})

/**
 * Command handler
 *
 */
const getTask = (cmd: string) => async ({ argvNoOptions, parsedOptions }: IEvaluatorArgs) => {
  const pipelineName = argvNoOptions[argvNoOptions.indexOf(cmd) + 1]
  const taskName = argvNoOptions[argvNoOptions.indexOf(cmd) + 2]

  const task = await fetchTask(pipelineName, taskName, parsedOptions.f)

  if (!task) {
    const err: CodedError = new Error('task not found')
    err.code = 404
    throw err
  } else if (!taskName) {
    return task
  } else {
    return {
      type: 'custom',
      isEntity: true,
      prettyType: 'task',
      name: taskName,
      packageName: pipelineName,
      contentType: 'yaml',
      content: task
    }
  }
}

export default (commandTree: CommandRegistrar) => {
  commandTree.listen('/tekton/get/task', getTask('task'), { usage: usage('task'), noAuthOk: true })
  commandTree.listen('/tekton/get/tasks', getTask('tasks'), { usage: usage('tasks'), noAuthOk: true })
}
