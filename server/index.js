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
  credentials: true,  // 如果你需要在请求中使用凭证（如cookies）
};

app.use(cors(corsOptions));
app.use(express.json());



// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initialContext = {
  role: 'system',
  content: [
    "你是一位信用卡领域的专家，精通各种信用卡的办理、使用方法、权益等信息和玩法。请像一个专业、自然而友好的客户经理一样为用户提供信用卡相关建议。注意：你的回答要清晰、具体，但是要自然，适当简洁，礼貌、不卑不亢，像人那样。",
    {
      "信用卡名称": "华夏KPL王者梦之队联名卡",
      "银行": "华夏银行",
      "卡片等级": "白金卡/金卡",
      "年费": {
        "白金卡": "680元/年",
        "金卡": "200元/年"
      },
      "基本信息": "卡面系列包括标准版、偶像版和梦叽版；通过微信、支付宝、云闪付线上消费可返“梦积金”",
      "消费返现": {
        "线上消费": "1%返梦积金",
        "月返现上限": "200梦积金"
      },
      "贵宾厅权益": "每年可享受6次国内机场贵宾厅服务",
      "保险权益": "无旅行保险",
      "购物优惠/返利": {
        "微信立减金兑换": "最高1.5:1兑换比例"
      },
      "其他特殊权益": "每月消费满10笔可参与梦积金兑换活动;每年可参与抽奖活动",
      "办理条件": {
        "年龄": "18岁以上,白金卡需35岁以下",
        "收入/资产": "无硬性收入要求，但建议有稳定收入",
        "消费要求": "新户需核卡30天内消费达标,白金卡需满足年度消费要求",
        "其他": "名下无其他华夏信用卡（新户资格）"
      },
      "备注": "白金卡每月返现上限为67-100元,年返现上限800-1200元"
    },
    {
      "信用卡名称": "华夏优享白",
      "银行": "华夏银行",
      "卡片等级": "白金卡",
      "年费": {
        "新户首年": "680元",
        "次年免年费条件": "积分兑换或消费达标"
      },
      "基本信息": "银联白金卡，提供机场贵宾厅、汽车代驾等高端服务",
      "消费返现": "无消费返现",
      "贵宾厅权益": "每年6次全球机场贵宾厅或12次国内高铁贵宾厅服务",
      "保险权益": {
        "航班延误险": "5000元",
        "旅行不便险": "2000元",
        "意外险": "100万元"
      },
      "购物优惠/返利": {
        "微信立减金礼包": "每月价值240元"
      },
      "其他特殊权益": "汽车代驾4次/年,高端健身及游泳滑雪等服务2次/年",
      "办理条件": {
        "年龄": "18岁以上,新户无年龄限制",
        "收入/资产": "建议年收入10万元以上",
        "消费要求": "核卡后90天内消费2笔99元以上",
        "其他": "需良好信用记录,且通过银行审批"
      },
      "备注": "冷门高性价比卡,对真实权益需求的持卡人有优势"
    },
    {
      "信用卡名称": "浦发AE白",
      "银行": "浦发银行",
      "卡片等级": "白金卡",
      "年费": "按年收取",
      "基本信息": "高端卡,提供多种机场、高尔夫等服务;2025年将按季度调整",
      "消费返现": {
        "境外消费": "1%返现",
        "季度上限": "3000元"
      },
      "贵宾厅权益": "每年8次国内机场贵宾厅,国际航班2次贵宾厅服务",
      "保险权益": {
        "航班延误险": "5000元(季度分配1250元)",
        "旅行意外险": "200万元"
      },
      "购物优惠/返利": {
        "线上商场购物返利": "5%,限特定合作商户"
      },
      "其他特殊权益": "全球紧急医疗服务,24小时客户支持",
      "办理条件": {
        "年龄": "18岁以上,新户无年龄限制",
        "收入/资产": "建议年收入15万元以上",
        "消费要求": "新户核卡30天内需消费达标,季度权益需提前领取",
        "其他": "需较高信用评分,通过银行详细审批"
      },
      "备注": "延误险额度和境外返现额度减少,相较于2024年权益有所缩水"
    },
    {
      "信用卡名称": "招行万事达金葵花借记卡",
      "银行": "招商银行",
      "卡片等级": "白金卡",
      "年费": "无条件免收账户管理费",
      "基本信息": "仅在广东省网点发行,为万事达白金级别",
      "消费返现": "无消费返现",
      "贵宾厅权益": "每月前3笔境外ATM取现手续费免收",
      "保险权益": "无旅行保险",
      "购物优惠/返利": {
        "货币兑换手续费": "免收",
        "境外汇款手续费": "免收"
      },
      "其他特殊权益": "专属礼遇，包括指定场所的高端餐饮、购物和旅游优惠",
      "办理条件": {
        "年龄": "18岁以上,无特定年龄限制",
        "收入/资产": "无硬性资产要求,但持有资产50万元享受更高礼遇",
        "消费要求": "无消费要求",
        "其他": "仅限线下办理,需在广东省指定网点"
      },
      "备注": "已持有招行银联I类户的用户需先降级或销卡,才能申请此卡"
    }
  ]
};

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

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          initialContext, // 添加背景信息到对话中
          { role: 'user', content: message }
        ],
        model: 'gpt-4o',
      });

      if (!completion.choices || completion.choices.length === 0) {
        return res.status(500).json({ error: 'OpenAI 没有回复' });
      }

      res.json({ reply: completion.choices[0].message.content });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      return res.status(500).json({ error: 'OpenAI 没有回复' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// ... existing code ...

const PORT = process.env.PORT || 8080; // 修改端口配置
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
