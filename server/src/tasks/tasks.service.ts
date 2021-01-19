import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  /**
   *
   * @param taskRepository
   */
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  /**
   *
   * @param filterDto
   * @param user
   */
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return await this.taskRepository.findByFilter(filterDto, user);
  }

  /**
   *
   * @param id
   * @param user
   */
  async getTaskById(id: number, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   *
   * @param createTaskDto
   * @param user
   */
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  /**
   *
   * @param id
   * @param status
   * @param user
   */
  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;

    return await task.save();
  }

  /**
   *
   * @param id
   * @param user
   */
  async deleteTaskById(id: number, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);

    await this.taskRepository.remove(task);

    return task;
  }
}
