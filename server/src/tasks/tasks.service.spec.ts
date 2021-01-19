import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = { id: 1, username: 'TestUser' };

const mockTask = {
  id: 1,
  title: 'Task',
  description: 'Mock task',
  status: TaskStatus.OPEN,
  user: mockUser,
  userId: 1,
  save: jest.fn(),
};

const mockTaskRepository = () => ({
  findByFilter: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  remove: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('should get all tasks from the task repository', async () => {
      taskRepository.findByFilter.mockResolvedValue([mockTask]);
      expect(taskRepository.findByFilter).not.toHaveBeenCalled();

      const filterDto: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query term',
      };

      const result = await tasksService.getTasks(filterDto, mockUser);
      expect(taskRepository.findByFilter).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getTaskById', () => {
    it('should call taskRepository.findOne and retrieve and return the task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      expect(taskRepository.findOne).not.toHaveBeenCalled();

      const result = await tasksService.getTaskById(mockTask.id, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockTask.id,
          userId: mockUser.id,
        },
      });
    });

    it('should throw an error if the task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskRepository.findOne).not.toHaveBeenCalled();

      await expect(
        tasksService.getTaskById(mockTask.id, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('should call taskRepository.createTask and return the created task', async () => {
      taskRepository.createTask.mockResolvedValue(mockTask);
      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const createTaskDto: CreateTaskDto = {
        title: mockTask.title,
        description: mockTask.description,
      };

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
    });
  });

  describe('deleteTask', () => {
    it('should call taskRepository.remove to delete a task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      expect(taskRepository.remove).not.toHaveBeenCalled();

      const result = await tasksService.deleteTaskById(mockTask.id, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw an error if the task could not be found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      expect(taskRepository.remove).not.toHaveBeenCalled();

      await expect(
        tasksService.deleteTaskById(mockTask.id, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update the status of the task ', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      mockTask.save.mockResolvedValue({
        ...mockTask,
        status: TaskStatus.DONE,
      });

      expect(taskRepository.findOne).not.toHaveBeenCalled();
      expect(mockTask.save).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(
        mockTask.id,
        TaskStatus.DONE,
        mockUser,
      );

      expect(mockTask.save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
