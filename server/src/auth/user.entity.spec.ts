import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User', () => {
  let user: User;

  beforeEach(async () => {
    user = new User();
    user.password = await bcrypt.hash('testPassword', await bcrypt.genSalt());
  });

  describe('validatePassword', () => {
    it('should return true if the password is valid', async () => {
      expect(user.validatePassword('testPassword')).resolves.toEqual(true);
    });

    it('should return false if the password is valid', async () => {
      expect(user.validatePassword('wrongPassword')).resolves.toEqual(false);
    });
  });
});
