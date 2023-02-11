import { NextFunction, Response, Router } from "express";
import * as Yup from 'yup'
import { docker } from "../docker.js";
import { HttpError } from "../HttpError.js";
import { errorHandler } from "../errorHandler.js";
import { tokenGuard } from "../guard/tokenGuard.js";

const deploySchema = Yup.object({
  service: Yup.string().required(),
  webhook: Yup.string().required(),
  timeout: Yup.number().required().min(0).max(30000) // ms
})

export const deployRoute = Router()
.post('/deploy', tokenGuard, async (req, res) => {
  const data = deploySchema.validateSync(req.body)

  const services = await docker.service.list({
    filters: JSON.stringify({
      name: {
        [data.service]: true
      }
    })
  })

  if (services.length === 0) {
    throw new HttpError('No services found', 404)
  } else if (services.length > 1) {
    throw new HttpError('More than one service found', 400)
  }

  const serviceTasks = await docker.task.list({
    filters: {
      service: {
        [data.service]: true
      },
      'desired-state': {
        running: true
      }
    }
  })

  console.log('updating')

  const start = new Date()

  await fetch(data.webhook, {
    method: 'post'
  })

  console.log('Updated')

  await new Promise<void>(resolve => {
    setTimeout(async () => {
      console.log('getting tasks')
      
      try {
        const tasks = await docker.task.list({
          filters: {
            service: {
              [data.service]: true
            }
          }
        })
  
        const taskList = [] as any[]

        for (const task of tasks) {
          const createdAt = new Date((task.data as any).CreatedAt)
          if (createdAt > start && !serviceTasks.find(s => s.id === task.id)) {
            taskList.push(task.data)
          }
        }
  
        if (taskList.length === 0) {
          throw new HttpError('No tasks were initialized', 500)
        } else if (taskList.find(t => t.Status.State !== 'running')) {
          throw new HttpError('Tasks failed to initialize', 500)
        }
      
        res.json({
          success: true,
          taskIds: taskList.map(t => t.ID)
        })
      } catch (err) {
        errorHandler(err, req, res, null as unknown as NextFunction)
      }
      
      resolve()
    }, data.timeout)
  })
})
