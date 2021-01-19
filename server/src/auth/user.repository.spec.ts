import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 1,
  username: 'TestUsername',
  password: 'TestPassword',
  save: jest.fn(),
  validatePassword: jest.fn(),
};

const mockCredentialsDto = {
  username: mockUser.username,
  password: mockUser.password,
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('register', () => {
    beforeEach(() => {
      userRepository.create = jest.fn();
    });

    it('should create a new user', async () => {
      userRepository.create.mockResolvedValue(mockUser);
      expect(userRepository.create).not.toHaveBeenCalled();

      const result = await userRepository.register(mockCredentialsDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the username already exists', async () => {
      userRepository.create.mockRejectedValue({ code: '23505' });

      expect(userRepository.register(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw an error if the username already exists', async () => {
      userRepository.create.mockRejectedValue({ code: '123123' }); // unhandled exception

      expect(userRepository.register(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validatePassword', () => {
    beforeEach(() => {
      userRepository.findOne = jest.fn();
    });

    it('should return true if the validation passes', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validatePassword(mockCredentialsDto);

      expect(result).toEqual(true);
    });

    it('should return false if the user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.validatePassword(mockCredentialsDto);

      expect(result).toBeNull();
    });

    it('should return false if the password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      const result = await userRepository.validatePassword(mockCredentialsDto);

      expect(result).toEqual(false);
    });
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash to generate a hash', async () => {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(mockUser.password, salt);

      const result = await userRepository.hashPassword(mockUser.password, salt);

      expect(result).toEqual(hash);
    });
  });
});
