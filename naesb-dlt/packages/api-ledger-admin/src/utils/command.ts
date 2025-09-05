import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const execCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.log('Bad exec error 01: ');
      console.log(command);
      console.error(stderr);
      throw new Error(stderr);
    }
    console.log('Good exec command.');
    console.log(command);
    return stdout;
  } catch (e) {
    console.log('Bad exec error 02: ');
    console.log(command);
    console.error(e);
  }
};
