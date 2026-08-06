const fs = require('fs');
const path = require('path');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

class BedrockService {
  constructor() {
    try {
      this.baristaKnowledge = fs.readFileSync(
        path.join(__dirname, '../data/barista-knowledge.txt'), 
        'utf8'
      );
    } catch (err) {
      console.warn('Could not load barista-knowledge.txt');
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
    // Use amazon.nova-lite-v1:0 or amazon.nova-micro-v1:0 for cost optimization
    this.modelId = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'; 
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

      const systemPrompt = `Bạn là một chuyên gia về cà phê (Barista). Dựa trên kiến thức cơ bản về cà phê được cung cấp dưới đây:
--- KIẾN THỨC BARISTA ---
${this.baristaKnowledge}
-------------------------
Hãy phân tích yêu cầu của người dùng về khẩu vị, cách pha, độ tuổi, và mức giá.
Sau đó, hãy gợi ý MỘT SỐ ID SẢN PHẨM PHÙ HỢP NHẤT từ danh sách sản phẩm dưới đây.
DANH SÁCH SẢN PHẨM HIỆN CÓ:
${productsContext}

QUAN TRỌNG: Câu trả lời của bạn PHẢI là một chuỗi JSON array chứa chính xác các ID của sản phẩm được gợi ý, không kèm theo bất kỳ văn bản giải thích nào khác. 
Ví dụ: ["64a123...", "64a456..."]`;

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

      const response = await this.client.send(command);
      const textOutput = response.output.message.content[0].text;
      
      // Parse the JSON array from the text output
      // In case the model adds some text before/after the JSON array
      const jsonMatch = textOutput.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(textOutput);
      }
    } catch (error) {
      console.error('Error getting recommendations from Bedrock:', error);
      throw error;
    }
  }
}

module.exports = new BedrockService();
