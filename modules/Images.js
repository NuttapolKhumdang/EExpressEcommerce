const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class Resize {
    constructor(folder) {
        this.folder = folder;
    }
    async save(buffer) {
        const filename = Resize.filename();
        const filepath = this.filepath(filename);

        await sharp(buffer)
            .webp()
            .resize(1280, 1280, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(filepath);

        return filename;
    }
    static filename() {
        return `${uuidv4()}.webp`;
    }
    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}

const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
        fieldSize: 8 * 1024 * 1024
    },
});

module.exports = { upload, Resize };