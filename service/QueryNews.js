const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const client = new Client({
    node: process.env.ES_HOME, // Elasticsearch node URL từ tệp .env
});

// Hàm tìm kiếm tin tức theo từ khóa
const queryNews = async (keywords) => {
    try {
        // Tạo query với multi_match và boost cho các trường khác nhau
        const response = await client.search({
            index: process.env.INDEX_NAME, // Thay bằng tên index của bạn
            body: {
                query: {
                    multi_match: {
                        query: keywords,  // Từ khóa tìm kiếm
                        fields: [
                            'keywords^3',  // Trường 'keywords' với boost 3
                            'title^2',     // Trường 'title' với boost 2
                            'description^1', // Trường 'description' với boost 1
                            'content^1'     // Trường 'content' với boost 1
                        ],
                        type: 'best_fields', // Loại multi_match query, có thể thay đổi tuỳ theo yêu cầu
                    }
                }
            }
        });

        // Trả về kết quả tìm kiếm
        return response.hits.hits;

    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Failed to fetch news from Elasticsearch');
    }
};

module.exports = { queryNews };
