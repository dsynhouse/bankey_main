const { GoogleGenAI } = require('@google/genai');

// Verification Script
(async () => {
    const apiKey = process.env.VITE_API_KEY;

    if (!apiKey) {
        console.error('❌ No API Key found.');
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    console.log(`🏥 Starting Health Check on [${model}]...`);

    try {
        const start = Date.now();
        const result = await ai.models.generateContent({
            model: model,
            contents: 'Ping',
        });
        const duration = Date.now() - start;

        if (result && result.text) {
            console.log(`✅ API ALIVE. Response: "${result.text()}" (${duration}ms)`);
            console.log('✅ Quota Status: HEALTHY');
            process.exit(0);
        } else {
            throw new Error('Empty response');
        }

    } catch (error) {
        console.error('❌ HEALTH CHECK FAILED');
        console.error(`Error: ${error.message}`);

        if (error.message.includes('429')) {
            console.error('⚠️ Critical: Quota Exceeded (429)');
        }
        process.exit(1);
    }
})();
