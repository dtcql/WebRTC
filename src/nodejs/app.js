const express = require('express');
const https = require('https');
const fs = require('fs');
const FacebodyClient = require('@alicloud/facebody20191230');
const OpenapiClient = require('@alicloud/openapi-client');
const TeaUtil = require('@alicloud/tea-util');
const cors = require('cors'); // 导入 cors 模块

const app = express();

// 读取 SSL 证书和私钥文件
const privateKey = fs.readFileSync('cert.key', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// 使用 cors 中间件启用跨域支持
app.use(cors());

app.get('/', async (req, res) => {
    const examId = req.query.exam_id;
    const roomSize = parseInt(req.query.room_size) || 1;

    // 完善您的阿里云API访问配置
    const accessKeyId = '***';
    const accessKeySecret = '***';

    const config = new OpenapiClient.Config({
        accessKeyId,
        accessKeySecret
    });

    config.endpoint = 'facebody.cn-shanghai.aliyuncs.com';
    const client = new FacebodyClient.default(config);

    // 在这里执行循环，依次调用图片检测并将结果写入JSON
    const results = {};
    console.log('URL:', req.originalUrl);
    console.log( 'roomsize=', roomSize);

    for (let i = 1; i <= roomSize; i++) {
        console.log('start processing student ', i, 'roomsize=', roomSize);
        const imageURL = `https://poc-online-exam-monitor.oss-cn-shanghai.aliyuncs.com/${examId}/${i}.jpg`;
        const monitorExaminationRequest = new FacebodyClient.MonitorExaminationRequest({
            type: 1,
            imageURL
        });

        const runtime = new TeaUtil.RuntimeOptions({});
        try {
            const monitorExaminationResponse = await client.monitorExaminationWithOptions(monitorExaminationRequest, runtime);

            // 获取当前时间并添加8个小时
            const checkTime = new Date();
            checkTime.setHours(checkTime.getHours() + 8);

            // 检查 cellPhone 和 earPhone 的 score 是否大于 threshold
            const isCalling = monitorExaminationResponse.body.data.personInfo.cellPhone.score > (monitorExaminationResponse.body.data.personInfo.cellPhone.threshold - 0.2) ? 1 : 0;
            const hasEarPhone = monitorExaminationResponse.body.data.personInfo.earPhone.score > (monitorExaminationResponse.body.data.personInfo.earPhone.threshold - 0.2) ? 1 : 0;

            // 构建学生的结果对象
            const studentResult = {
                'phone': isCalling,
                'earphone': hasEarPhone,
                'time': checkTime.toISOString(), // 使用 ISO 格式的时间
            };

            results[`student ${i}`] = studentResult;
        } catch (error) {
            const errorResult = {
                'phone': 2,
                'earphone': 2,
                'time': 2,
            };
            results[`student ${i}`] = errorResult;
            console.error('Error fetching API:', error);
            continue;
        }
    }

    // 将结果写入JSON文件
    const jsonResult = JSON.stringify(results, null, 2);
    fs.writeFileSync('results.json', jsonResult);
    console.log(results);
    res.json(results);
});

// 创建 HTTPS 服务器
const httpsServer = https.createServer(credentials, app);

// 启动 HTTPS 服务器
httpsServer.listen(1818, () => {
    console.log('API listening on port 1818 (HTTPS)');
});
