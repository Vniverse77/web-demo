
        import { GoogleGenerativeAI } from "@google/generative-ai";

        async function callGemini() {
            // FOR LOCAL TESTING ONLY 
            const apiKey = document.getElementById('apiKeyInput').value;
            if (!apiKey) {
                alert("Please enter an API Key for testing.");
                return;
            }
            
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = "What is the capital of France?";
            document.getElementById('response').innerText = "Thinking...";

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                document.getElementById('response').innerText = text;
            } catch (error) {
                console.error("Error:", error);
                document.getElementById('response').innerText = "Error: " + error.message;
            }
        }
        window.callGemini = callGemini;
   