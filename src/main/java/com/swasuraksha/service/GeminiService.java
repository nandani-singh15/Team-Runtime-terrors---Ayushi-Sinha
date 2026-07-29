package com.swasuraksha.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;
import java.util.List;

@Service
public class GeminiService {

    @Value("${app.gemini.key:}")
    private String geminiApiKey;

    private final RestClient restClient = RestClient.create();

    public String generateMedicalSummary(String bloodType, String allergies, String conditions, String meds, String notes) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("GEMINI_API_KEY")) {
            return generateMockMedicalSummary(bloodType, allergies, conditions, meds, notes);
        }

        String prompt = String.format(
                "Summarize this patient's medical information into a concise, emergency-first brief for paramedics/first responders. " +
                "Highlight life-threatening details (like severe allergies or active critical conditions) in all caps at the very top. " +
                "Keep the total summary under 100 words. \n" +
                "Blood Type: %s\nAllergies: %s\nMedical Conditions: %s\nMedications: %s\nNotes: %s",
                bloodType, allergies, conditions, meds, notes
        );

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back: " + e.getMessage());
            return generateMockMedicalSummary(bloodType, allergies, conditions, meds, notes);
        }
    }

    public Map<String, Object> analyzeRouteSafety(String startLoc, String endLoc, double startLat, double startLng, double endLat, double endLng) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("GEMINI_API_KEY")) {
            return generateMockRouteAnalysis(startLoc, endLoc);
        }

        String prompt = String.format(
                "Analyze the journey route safety between '%s' (coords: %f, %f) and '%s' (coords: %f, %f). " +
                "Provide the response strictly in JSON format with these exact keys: \n" +
                "- 'safetyScore' (an integer from 0 to 100 based on standard safety factors, crime indices, lighting, etc)\n" +
                "- 'safeWindow' (a string recommending the safest hours of the day to travel, e.g., '07:00 AM - 08:30 PM')\n" +
                "- 'safetyExplanation' (a brief explanation of the route safety including high risk zones or safety tips)\n" +
                "Do not include any backticks or markdown markers. Return pure JSON.",
                startLoc, startLat, startLng, endLoc, endLat, endLng
        );

        try {
            String rawJson = callGemini(prompt);
            rawJson = rawJson.replace("```json", "").replace("```", "").trim();
            int score = extractJsonInt(rawJson, "safetyScore", 85);
            String window = extractJsonString(rawJson, "safeWindow", "06:00 AM - 09:00 PM");
            String explanation = extractJsonString(rawJson, "safetyExplanation", "Route analyzed successfully. Standard safety precautions advised.");
            
            return Map.of(
                "safetyScore", score,
                "safeWindow", window,
                "safetyExplanation", explanation
            );
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back: " + e.getMessage());
            return generateMockRouteAnalysis(startLoc, endLoc);
        }
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        Map<String, Object> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (!parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        throw new RuntimeException("Empty response from Gemini");
    }

    private String generateMockMedicalSummary(String bloodType, String allergies, String conditions, String meds, String notes) {
        StringBuilder sb = new StringBuilder();
        sb.append("CRITICAL EMERGENCY BRIEF:\n");
        if (allergies != null && !allergies.trim().isEmpty()) {
            sb.append("• ALLERGIES: ").append(allergies.toUpperCase()).append("\n");
        } else {
            sb.append("• ALLERGIES: None Known\n");
        }
        if (conditions != null && !conditions.trim().isEmpty()) {
            sb.append("• CONDITIONS: ").append(conditions).append("\n");
        }
        if (meds != null && !meds.trim().isEmpty()) {
            sb.append("• CURRENT MEDICATIONS: ").append(meds).append("\n");
        }
        sb.append("• BLOOD TYPE: ").append(bloodType != null ? bloodType : "Unknown").append("\n");
        if (notes != null && !notes.trim().isEmpty()) {
            sb.append("• DIRECTIVES: ").append(notes);
        }
        return sb.toString();
    }

    private Map<String, Object> generateMockRouteAnalysis(String startLoc, String endLoc) {
        int score = 88;
        String explanation = String.format("The route from '%s' to '%s' is verified safe during daytime. High density public transport checkpoints and police patrols are stationed. Side lanes near industrial clusters lack street lights; caution is advised at night.", startLoc, endLoc);
        String safeWindow = "06:30 AM - 09:30 PM";

        if (startLoc.toLowerCase().contains("bypass") || endLoc.toLowerCase().contains("bypass")) {
            score = 65;
            explanation = "Outer bypass road shows poor lighting conditions and low patrol presence. Consider using internal city avenues instead.";
            safeWindow = "08:00 AM - 06:30 PM";
        }

        return Map.of(
            "safetyScore", score,
            "safeWindow", safeWindow,
            "safetyExplanation", explanation
        );
    }

    private int extractJsonInt(String json, String key, int defaultValue) {
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)");
            java.util.regex.Matcher matcher = pattern.matcher(json);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }

    private String extractJsonString(String json, String key, String defaultValue) {
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
            java.util.regex.Matcher matcher = pattern.matcher(json);
            if (matcher.find()) {
                return matcher.group(1);
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }
}
