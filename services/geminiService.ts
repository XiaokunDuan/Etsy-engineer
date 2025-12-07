import { GoogleGenAI, Type } from "@google/genai";
import { EtsyListingData } from "../types";

// Etsy Standard Attributes
const COLORS = [
  "Beige", "Black", "Blue", "Bronze", "Brown", "Clear", "Copper", "Gold", "Gray", "Green", 
  "Orange", "Pink", "Purple", "Rainbow", "Red", "Rose gold", "Silver", "White", "Yellow"
];

const FABRICS = [
  "Alligator leather", "Alpaca", "Angora", "Artificial silk", "Barkcloth", "Batiste", "Batting", 
  "Bison leather", "Bouclé", "Broadcloth", "Brocade", "Buckram", "Burlap", "Cable knit", "Calf leather", 
  "Cambric", "Camel hair", "Canvas", "Cashmere", "Challis", "Chambray", "Chanderi", "Charmeuse", 
  "Cheesecloth", "Chenille", "Chiengora", "Chiffon", "Chino", "Chintz", "Corduroy", "Cork", "Cotton", 
  "Cowhide", "Crepe", "Crepe back satin", "Crepe de chine", "Crinoline", "Damask", "Deer leather", 
  "Denim", "Dobby", "Dola silk", "Double face", "Double knit", "Eyelet", "Faille", "Faux fur", 
  "Faux leather", "Felt", "Flannel", "Fleece", "Fur", "Gabardine", "Gauze", "Gazar", "Georgette", 
  "Gingham", "Goat leather", "Grasscloth", "Guanaco", "Herringbone", "Horse leather", "Houndstooth", 
  "Interlock knit", "Jacquard", "Jersey knit", "Kente", "Khadi", "Lace", "Lambswool", "Lame & metallic", 
  "Leather", "Linen", "Llama", "Madras", "Matelassé", "Merino", "Mesh", "Microfiber", "Minky", "Moiré", 
  "Moleskin", "Muga silk", "Muslin", "Mysore silk", "Neoprene", "Netting", "Oilcloth", "Organdy", 
  "Organza", "Ostrich leather", "Pashmina", "Percale", "Pig leather", "Pique", "Pongee", "Qiviut", 
  "Rabbit", "Raschel", "Rib knit", "Ripstop", "Sari silk", "Sateen", "Satin", "Scrim", "Seersucker", 
  "Sequins", "Shantung & dupioni", "Sheep leather", "Sheepskin", "Sherpa", "Silk", "Snake leather", 
  "Spandex", "Suede", "Suri", "Taffeta", "Terry cloth", "Thermal knit", "Tricot", "Tulle", "Tussar silk", 
  "Tweed", "Twil", "Ultrasuede", "Velour", "Velvet", "Velveteen", "Vicuna", "Vinyl", "Voile", "Wool", "Yak"
];

const OCCASIONS = [
  "1st birthday", "Anniversary", "Baby shower", "Bachelor party", "Bachelorette party", "Back to school", 
  "Baptism", "Bar & Bat Mitzvah", "Birthday", "Bridal shower", "Confirmation", "Divorce & breakup", 
  "Engagement", "First Communion", "Graduation", "Grief & mourning", "Housewarming", "LGBTQ pride", 
  "Moving", "Pet loss", "Prom", "Quinceañera & Sweet 16", "Retirement", "Wedding"
];

const HOLIDAYS = [
  "April Fools'", "Christmas", "Cinco de Mayo", "Easter", "Father's Day", "Halloween", "Hanukkah", 
  "Independence Day", "Kwanzaa", "Lunar New Year", "Mother's Day", "New Year's", "Passover", 
  "St Patrick's Day", "Thanksgiving", "Valentine's Day"
];

// Helper to convert file to Base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const generateListingInfo = async (files: File[]): Promise<EtsyListingData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Process all files concurrently
  const imageParts = await Promise.all(files.map(file => fileToGenerativePart(file)));

  const prompt = `
    You are an expert Etsy SEO specialist. 
    Analyze these product images and generate a high-quality Etsy listing description and attributes.
    
    1. Description: Write a professional, "Best Seller" quality description.
       - Structure: 
         (a) Engaging Hook.
         (b) What's Included: CLEARLY state exactly what the buyer gets. EXPLICITLY state "Props/Decor not included" if relevant.
         (c) Measurements/Fit: Provide specific measurements or mention "Fits standard X". Mention that items are tested for fit if applicable.
         (d) Materials: Mention specific materials (e.g., "Handcrafted with [Material]").
         (e) Production/Care: Mention "Made to order", "Handmade in a smoke-free/pet-free environment", and "Care instructions".
       - Tone: Helpful, detailed, transparent, and defensive (managing expectations about props/shipping).

    2. Attributes: YOU MUST SELECT FROM THE PROVIDED LISTS ONLY. If no fit, return empty string.
       - Primary Color: Choose from [${COLORS.join(", ")}]
       - Secondary Color: Choose from [${COLORS.join(", ")}]
       - Primary Fabric: Choose from [${FABRICS.join(", ")}]
       - Occasion: Choose from [${OCCASIONS.join(", ")}]
       - Holiday: Choose from [${HOLIDAYS.join(", ")}]

    3. Materials: List of likely materials used.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      // Spread all image parts followed by the text prompt
      parts: [...imageParts, { text: prompt }],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          primaryColor: { type: Type.STRING },
          secondaryColor: { type: Type.STRING },
          primaryFabric: { type: Type.STRING },
          occasion: { type: Type.STRING },
          holiday: { type: Type.STRING },
          materials: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["description", "materials"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as EtsyListingData;
};
