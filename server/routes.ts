import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";
import backupRoutes from "./routes/backup";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Nutrition label analysis endpoint
  app.post("/api/analyze-nutrition", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o for vision capabilities
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this nutrition label image and extract the nutritional information. 

IMPORTANT: Always use the TOTAL/MAIN values, NOT subcategories:
- For carbohydrates: Use "Total Carbohydrate" or "Total Carbs" - NOT "Dietary Fiber", "Total Sugars", or "Added Sugars"
- For fats: Use "Total Fat" - NOT "Saturated Fat", "Trans Fat", or "Unsaturated Fat"
- For protein: Use the main "Protein" value

Return a JSON object with the following structure:
{
  "name": "Product name if visible, otherwise 'Food Item'",
  "servingSize": "serving size as shown (e.g., '1 cup (240g)')",
  "calories": number,
  "protein": number in grams,
  "carbs": number in grams (use TOTAL Carbohydrate),
  "fats": number in grams (use TOTAL Fat),
  "fiber": number in grams
}

If you cannot read certain values clearly, make reasonable estimates based on what you can see. Only return the JSON object, no other text.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:")
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ error: "Could not parse nutrition data" });
      }

      const nutritionData = JSON.parse(jsonMatch[0]);
      
      return res.json({
        success: true,
        data: {
          name: nutritionData.name || "Food Item",
          servingSize: nutritionData.servingSize || "1 serving",
          calories: Number(nutritionData.calories) || 0,
          protein: Number(nutritionData.protein) || 0,
          carbs: Number(nutritionData.carbs) || 0,
          fats: Number(nutritionData.fats) || 0,
          fiber: Number(nutritionData.fiber) || 0,
        },
      });
    } catch (error: any) {
      console.error("Nutrition analysis error:", error);
      
      let errorMessage = "Failed to analyze nutrition label. Please try again.";
      
      if (error.code === "insufficient_quota") {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.code === "invalid_api_key") {
        errorMessage = "API configuration issue. Please contact support.";
      } else if (error.message?.includes("Could not process image")) {
        errorMessage = "Could not process the image. Please ensure it's a clear photo of a nutrition label.";
      } else if (error.message?.includes("rate_limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.status === 400) {
        errorMessage = "The image could not be analyzed. Please take a clearer photo of the nutrition label.";
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Register auth and data routes
  app.use("/api/auth", authRoutes);
  app.use("/api", dataRoutes);
  app.use("/api/backup", backupRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
