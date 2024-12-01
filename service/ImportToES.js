const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');

// Load cấu hình từ file .env tương ứng với NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const client = new Client({
    node: process.env.ES_HOME, // Elasticsearch node URL từ tệp .env
});

// Hàm import dữ liệu vào Elasticsearch
const importToES = async (importedData) => {
    try {
        console.log('imported data', importedData[0]);
        if (!Array.isArray(importedData) || importedData.length === 0) {
            throw new Error('importedData must be a non-empty array');
        }

        const bulkResponse = await client.helpers.bulk({
            datasource: importedData,
            onDocument: (doc) => ({ index: { _index: process.env.INDEX_NAME } }),
        });

        // Kiểm tra lỗi nếu có
        if (bulkResponse.errors) {
            const erroredDocuments = [];
            bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                        document: body[i * 2 + 1],
                    });
                }
            });
            console.error('Errors during bulk import:', erroredDocuments);
            throw new Error('Some documents failed to import');
        }

        console.log('All documents imported successfully!');
    } catch (error) {
        console.error('Error importing data to Elasticsearch:', error);
        throw new Error('Failed to import data to Elasticsearch');
    }
};

module.exports = { importToES };
