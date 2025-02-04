const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

class UploadService {
    constructor() {
        this.uploadDir = path.join(__dirname, '..', 'uploads');
        this.ensureUploadDirectoryExists();
    }

    ensureUploadDirectoryExists() {
        try {
            if (!fs.existsSync(this.uploadDir)) {
                fs.mkdirSync(this.uploadDir, { recursive: true });
            }
        } catch (error) {
            console.error('Erro ao criar diretório de uploads:', error);
            throw error;
        }
    }

    async saveBase64Image(base64String, prefix = '') {
        try {
            // Remove o cabeçalho da string base64 se existir
            const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
            
            // Gera um nome único para o arquivo
            const fileName = `${prefix}_${crypto.randomBytes(16).toString('hex')}.jpg`;
            const filePath = path.join(this.uploadDir, fileName);

            // Salva o arquivo
            await fs.promises.writeFile(filePath, base64Data, 'base64');

            return fileName;
        } catch (error) {
            console.error('Erro ao salvar imagem:', error);
            throw error;
        }
    }

    async deleteFile(fileName) {
        try {
            const filePath = path.join(this.uploadDir, fileName);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            throw error;
        }
    }

    getFilePath(fileName) {
        return path.join(this.uploadDir, fileName);
    }

    // Configuração do multer para upload de arquivos
    getMulterConfig(subDir = '') {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = subDir ? path.join(this.uploadDir, subDir) : this.uploadDir;
                
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        });

        const fileFilter = (req, file, cb) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Tipo de arquivo não permitido. Apenas imagens, PDFs e documentos são aceitos.'), false);
            }
        };

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
                files: 5 // Máximo de 5 arquivos por vez
            }
        });
    }

    // Método para processar o upload de arquivos
    getUploadMiddleware(subDir = '') {
        return this.getMulterConfig(subDir).array('attachments');
    }
}

module.exports = new UploadService(); 