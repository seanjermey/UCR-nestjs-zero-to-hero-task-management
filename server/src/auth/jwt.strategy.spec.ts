import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = new User();
mockUser.username = 'testUser';

const mockPayload = { username: mockUser.username };

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('should validate and return the user based on JWT payload', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(mockPayload);

      expect(userRepository.findOne).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual(mockUser);
    });

    it('should throw an exception if the user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
