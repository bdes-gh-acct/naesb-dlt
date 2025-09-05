import * as fs from 'fs';

export const saveFile = (filename: string, content: string) => {
  try {
    fs.writeFile(filename, content, function (err) {
      if (err) console.log(err);
    });
  } catch (e) {
    throw new Error('Unable to create file...');
  }
};

export const readFile = (filename: string) => {
  try {
    return fs.readFileSync(filename).toString();
  } catch (e) {
    throw new Error('Unable to read file...');
  }
};
