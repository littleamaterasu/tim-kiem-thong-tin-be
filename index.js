const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Middleware để parse JSON body
const getAllNews = require('./service/GetAllNews');
const { importToES } = require('./service/ImportToES'); // Import hàm importToES từ file service
const { queryNews } = require('./service/QueryNews');
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS và Body Parser
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request body

// Route chính để lấy tin tức
app.get('/news', async (req, res) => {
    try {
        const from = parseInt(req.query.from, 10) || 0; // Giá trị `from` (mặc định 0)
        const to = parseInt(req.query.to, 10) || 10;   // Giá trị `to` (mặc định 10)

        if (from >= to) {
            return res.status(400).json({ error: "`from` must be less than `to`" });
        }

        const news = await getAllNews.getAllNews(from, to); // Gọi hàm getAllNews
        res.status(200).json({ data: news });   // Trả về dữ liệu tin tức
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route import dữ liệu vào Elasticsearch
app.post('/import', async (req, res) => {
    try {
        console.log('req body', req.body.data)
        const importedData = req.body.data; // Lấy dữ liệu từ request body

        if (!Array.isArray(importedData) || importedData.length === 0) {
            return res.status(400).json({ error: 'Invalid data. Must be a non-empty array.' });
        }

        await importToES(importedData); // Gọi hàm importToES để nhập dữ liệu
        res.status(200).json({ message: 'Data imported successfully!' }); // Phản hồi thành công
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Failed to import data to Elasticsearch' });
    }
});

// Route tìm kiếm tin tức theo từ khóa
app.post('/search', async (req, res) => {
    try {
        console.log(req.body)
        const keywords = req.body.keywords; // Lấy từ khóa từ query string

        if (!keywords) {
            return res.status(400).json({ error: 'Please provide search keywords' });
        }

        // Gọi hàm queryNews để tìm kiếm tin tức
        const searchResults = await queryNews(keywords);

        // Trả về kết quả tìm kiếm
        res.status(200).json({ data: searchResults });
    } catch (error) {
        console.error('Error searching news:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`ES is running on ${process.env.ES_HOME}`);
    console.log(`Server is running on http://localhost:${PORT}`);
});
