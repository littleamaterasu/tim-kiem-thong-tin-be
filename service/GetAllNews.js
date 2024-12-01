const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv')
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const client = new Client({
    node: process.env.ES_HOME, // Elasticsearch node URL từ tệp .env
});

// Hàm lấy tin tức theo số thứ tự
const getAllNews = async (from, to) => {
    try {
        // Tính toán số lượng kết quả cần lấy
        const size = to - from;

        const response = await client.search({
            index: process.env.INDEX_NAME, // Tên chỉ mục
            from,          // Vị trí bắt đầu (zero-based index)
            size,          // Số lượng kết quả
            body: {
                query: {
                    match_all: {}, // Lấy tất cả tài liệu (tuỳ chỉnh nếu cần)
                },
            },
        });

        return response.hits.hits.map((hit) => hit._source); // Trả về dữ liệu gốc
    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Failed to fetch news from Elasticsearch');
    }
}

module.exports = { getAllNews };
