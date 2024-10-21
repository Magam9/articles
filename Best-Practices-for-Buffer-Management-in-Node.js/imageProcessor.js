import { createReadStream, createWriteStream } from 'node:fs';
import { PNG } from 'pngjs';

function convertToGrayscale(inputFilePath, outputFilePath) {
  createReadStream(inputFilePath)
    .pipe(new PNG())
    .on('parsed', function () {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;
          const r = this.data[idx];
          const g = this.data[idx + 1];
          const b = this.data[idx + 2];
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          this.data[idx] = gray;
          this.data[idx + 1] = gray;
          this.data[idx + 2] = gray;
        }
      }

        this.pack().pipe(createWriteStream(outputFilePath))
            .on('finish', () => console.log(`Image saved as ${outputFilePath}`));
    })
    .on('error', (err) => console.error('Error:', err));
  }

convertToGrayscale('image.png', 'grayscale_image.png');
