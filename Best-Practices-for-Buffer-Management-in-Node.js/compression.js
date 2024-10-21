import { createReadStream, createWriteStream } from 'node:fs';
import archiver from 'archiver';
import unzipper from 'unzipper';

function compressDecompressFile(inputFilePath, compressedFilePath, decompressedFilePath) {
  const output = createWriteStream(compressedFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`File successfully compressed to ${compressedFilePath}`);
    
    const compressedStream = createReadStream(compressedFilePath);
    compressedStream.pipe(unzipper.Extract({ path: decompressedFilePath }))
      .on('close', () => {
        console.log(`File successfully decompressed to ${decompressedFilePath}`);
      });
  });

  archive.on('error', (err) => {
    console.error('Error during compression:', err);
  });

  archive.pipe(output);
  archive.file(inputFilePath, { name: 'example.txt' });
  archive.finalize();
}

compressDecompressFile('example.txt', 'example.zip', 'decompressed_example');
