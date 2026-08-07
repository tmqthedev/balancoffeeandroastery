const fs = require('fs');
const path = require('path');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const logger = require('../utils/logger');

class BedrockService {
  constructor() {
    try {
      this.baristaKnowledge = fs.readFileSync(
        path.join(__dirname, '../data/barista-knowledge.txt'), 
        'utf8'
      );
    } catch (err) {
      logger.warn('Could not load barista-knowledge.txt');
      this.baristaKnowledge = '- Arabica: Ít cafein, vị chua thanh, hương thơm phong phú.\n- Robusta: Nhiều cafein, vị đắng đậm, mạnh mẽ.';
    }
    const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
      : undefined;

    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      ...(credentials ? { credentials } : {})
    });
    // Use apac.amazon.nova-lite-v1:0 or apac.amazon.nova-micro-v1:0 for cross-region inference
    this.modelId = process.env.BEDROCK_MODEL_ID || 'apac.amazon.nova-lite-v1:0'; 
  }

  async getRecommendations(prompt, products) {
    try {
      // Chuẩn bị dữ liệu context các sản phẩm
      const productsContext = products.map(p => {
        const category = typeof p.category === 'object'
          ? (p.category.slug || p.category.name || p.categoryId || '')
          : (p.category || p.categoryId || '');

        return `ID: ${p._id.toString()} | Name: ${p.name} | Category: ${category} | Price: ${p.price} | Desc: ${p.description}`;
      }).join('\n');

      const systemPrompt = `Bạn là một chuyên gia về cà phê (Barista) tư vấn trực tiếp cho khách hàng. Bạn có thể giao tiếp trôi chảy bằng cả Tiếng Việt và Tiếng Anh.
Dựa trên kiến thức về cà phê:
--- KIẾN THỨC BARISTA ---
${this.baristaKnowledge}
-------------------------
Hãy giao tiếp thân thiện, tư vấn đồ uống phù hợp với yêu cầu của khách hàng và chọn ra MỘT SỐ ID SẢN PHẨM TỐT NHẤT từ danh sách hiện có dưới đây.
DANH SÁCH SẢN PHẨM HIỆN CÓ:
${productsContext}

QUAN TRỌNG: Bạn PHẢI trả lời bằng ĐÚNG NGÔN NGỮ (Tiếng Anh hoặc Tiếng Việt) mà khách hàng đã sử dụng để hỏi bạn.
Bạn PHẢI trả về ĐÚNG DUY NHẤT một đối tượng JSON hợp lệ (không kèm theo code block markdowns hay text nào bên ngoài) với 2 trường sau:
- "reply": Câu trả lời giao tiếp với khách hàng (bằng Tiếng Anh hoặc Tiếng Việt tùy theo câu hỏi, thái độ thân thiện).
- "recommendedIds": Mảng chứa các ID sản phẩm được chọn (chỉ chứa chuỗi ID).
Ví dụ:
{
  "reply": "Dạ, để tỉnh táo buổi sáng thì món cà phê đen đá là lựa chọn tuyệt vời ạ. Mình gợi ý cho bạn món này nha!",
  "recommendedIds": ["64a123...", "64a456..."]
}`;

      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }]
          }
        ],
        system: [
          { text: systemPrompt }
        ],
        inferenceConfig: {
          maxTokens: 500,
          temperature: 0.2, // Low temp for more deterministic JSON output
        }
      });

      logger.debug('Bedrock recommendation request prepared for', products.length, 'products');

      const response = await this.client.send(command);
      const textOutput = response.output.message.content[0].text;
      logger.debug('Bedrock model response received');
      
      // Parse the JSON object from the text output
      // In case the model adds some text before/after the JSON
      const jsonMatch = textOutput.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(textOutput);
      }
    } catch (error) {
      logger.error('Error getting recommendations from Bedrock:', error);
      throw error;
    }
  }
}

module.exports = new BedrockService();
