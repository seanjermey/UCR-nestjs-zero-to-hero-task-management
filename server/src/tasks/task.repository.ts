import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  /**
   *
   */
  private logger = new Logger('TaskRepository');

  /**
   *
   * @param search
   * @param status
   * @param user
   */
  async findByFilter(
    { search, status }: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :user', { user: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      return await query.getMany();
    } catch (err) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }", Filters: ${JSON.stringify({ search, status })}`,
        err.stack,
      );

      throw new InternalServerErrorException();
    }
  }

  /**
   *
   * @param title
   * @param description
   * @param user
   */
  async createTask(
    { title, description }: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    try {
      const task = await this.save({
        title,
        description,
        status: TaskStatus.OPEN,
        user,
      });

      delete task.user;

      return task;
    } catch (err) {
      this.logger.error(
        `Failed to create a task for user "${
          user.username
        }", Data: ${JSON.stringify({ title, description })}`,
        err.stack,
      );

      throw new InternalServerErrorException();
    }
  }
}
