import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Simplified CORS configuration since we're serving from same origin
const allowedOrigins = ['https://taupe-speculoos-17b460.netlify.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 内存缓存上下文结构
let conversationContext = [];

// System content, 仅在新对话时添加
const systemContent = [
  {
    role: 'system',
    content: "1、你是一位专业的信用卡客户经理，精通各种信用卡的权益、办理门槛、免年费条件等。你的任务是根据给你的资料，解答用户在办理信用卡过程中的各种问题。2、首先要理解用户的问题：1）如果用户只是打招呼，没有明确的诉求和倾向，那么你需要问他，一般可以问他想要什么权益；2）用户如果有明确诉求，比如权益、门槛等，那么那么根据资料回复即可。3、在回复时要注意：1）像人一样，直接、明确、具体的回答问题，但要注意不要冗长；2）回复答案格式要清晰，但尽量避免一些特殊字符；3）不要向用户密集提问，一次最多问一个问题就行；4）推荐卡片时也不要一股脑推太多，推符合要求的1-2张即可。"
  },
  {
    role: 'system',
    content: "信用卡名称: 华夏KPL王者梦之队联名卡\n银行: 华夏银行\n卡片等级: 白金卡/金卡\n年费: 白金卡: 680元/年, 金卡: 200元/年\n基本信息: 卡面系列包括标准版、偶像版和梦叽版；通过微信、支付宝、云闪付线上消费可返“梦积金”\n消费返现: 线上消费: 1%返梦积金, 月返现上限: 200梦积金\n贵宾厅权益: 每年可享受6次国内机场贵宾厅服务\n保险权益: 无旅行保险\n购物优惠/返利: 微信立减金兑换: 最高1.5:1兑换比例\n其他特殊权益: 每月消费满10笔可参与梦积金兑换活动; 每年可参与抽奖活动\n办理条件: 年龄: 18岁以上, 白金卡需35岁以下; 无硬性收入要求，但建议有稳定收入\n备注: 白金卡每月返现上限为67-100元, 年返现上限800-1200元"
  },
  {
    role: 'system',
    content: "信用卡名称: 华夏优享白\n银行: 华夏银行\n卡片等级: 白金卡\n年费: 新户首年: 680元, 次年免年费条件: 积分兑换或消费达标\n基本信息: 银联白金卡，提供机场贵宾厅、汽车代驾等高端服务\n消费返现: 无消费返现\n贵宾厅权益: 每年6次全球机场贵宾厅或12次国内高铁贵宾厅服务\n保险权益: 航班延误险: 5000元, 旅行不便险: 2000元, 意外险: 100万元\n购物优惠/返利: 微信立减金礼包: 每月价值240元\n其他特殊权益: 汽车代驾4次/年, 高端健身及游泳滑雪等服务2次/年\n办理条件: 年龄: 18岁以上, 新户无年龄限制; 建议年收入10万元以上\n备注: 冷门高性价比卡, 对真实权益需求的持卡人有优势"
  },
  {
    role: 'system',
    content: "信用卡名称: 浦发AE白\n银行: 浦发银行\n卡片等级: 白金卡\n年费: 按年收取\n基本信息: 高端卡, 提供多种机场、高尔夫等服务; 2025年将按季度调整\n消费返现: 境外消费: 1%返现, 季度上限: 3000元\n贵宾厅权益: 每年8次国内机场贵宾厅, 国际航班2次贵宾厅服务\n保险权益: 航班延误险: 5000元(季度分配1250元), 旅行意外险: 200万元\n购物优惠/返利: 线上商场购物返利: 5%, 限特定合作商户\n其他特殊权益: 全球紧急医疗服务, 24小时客户支持\n办理条件: 年龄: 18岁以上, 新户无年龄限制; 建议年收入15万元以上\n备注: 延误险额度和境外返现额度减少, 相较于2024年权益有所缩水"
  },
  {
    role: 'system',
    content: "信用卡名称: 招行万事达金葵花借记卡\n银行: 招商银行\n卡片等级: 白金卡\n年费: 无条件免收账户管理费\n基本信息: 仅在广东省网点发行, 为万事达白金级别\n消费返现: 无消费返现\n贵宾厅权益: 每月前3笔境外ATM取现手续费免收\n保险权益: 无旅行保险\n购物优惠/返利: 货币兑换手续费: 免收, 境外汇款手续费: 免收\n其他特殊权益: 专属礼遇，包括指定场所的高端餐饮、购物和旅游优惠\n办理条件: 年龄: 18岁以上, 无特定年龄限制; 无硬性资产要求, 但持有资产50万元享受更高礼遇\n备注: 已持有招行银联I类户的用户需先降级或销卡, 才能申请此卡"
  }
];

// 初始化上下文为系统内容
conversationContext = [...systemContent];

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // 添加用户消息到上下文
    conversationContext.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      messages: conversationContext,
      model: 'gpt-4o',
    });

    if (!completion.choices || completion.choices.length === 0) {
      return res.status(500).json({ error: 'OpenAI 没有回复' });
    }

    // 获取回复并添加到上下文
    const reply = completion.choices[0].message.content;
    conversationContext.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
