package com.agriease.backend.service;

import com.agriease.backend.dto.DiseasePredictionResponse;
import com.agriease.backend.dto.DiseaseReportResponse;
import com.agriease.backend.entity.PlantDiseaseReport;
import com.agriease.backend.entity.User;
import com.agriease.backend.repository.PlantDiseaseReportRepository;
import com.agriease.backend.repository.UserRepository;
import com.agriease.delivery.services.CloudinaryUploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiseaseService {

    private final PlantDiseaseReportRepository reportRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    @Value("${disease.ai.fallback.enabled:true}")
    private boolean aiFallbackEnabled;

    public DiseaseService(PlantDiseaseReportRepository reportRepository,
                          UserRepository userRepository,
                          RestTemplate restTemplate,
                          CloudinaryUploadService cloudinaryUploadService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.cloudinaryUploadService = cloudinaryUploadService;
    }

    public DiseaseReportResponse analyzeAndSave(MultipartFile file, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Store the uploaded image in persistent cloud storage, then send the same bytes to AI.
        String imagePath = cloudinaryUploadService.uploadImage(file, "agriease/plant-disease");
        DiseasePredictionResponse prediction = predictWithMultipart(file);

        if (prediction == null) {
            throw new RuntimeException("AI service did not return a prediction");
        }

        // 3) Save report
        PlantDiseaseReport report = new PlantDiseaseReport();
        report.setUser(user);
        report.setImagePath(imagePath);
        report.setDisease(prediction.getDisease());
        report.setConfidence(prediction.getConfidence());
        report.setRecommendation(prediction.getRecommendation());

        PlantDiseaseReport saved = reportRepository.save(report);

        // 4) Map to DTO (include description/prevention/buy_link returned by AI)
        DiseaseReportResponse response = new DiseaseReportResponse();
        response.setId(saved.getId());
        response.setImagePath(saved.getImagePath());
        response.setDisease(saved.getDisease());
        response.setConfidence(saved.getConfidence());
        response.setRecommendation(saved.getRecommendation());
        response.setDescription(prediction.getDescription());
        response.setPrevention(prediction.getPrevention());
        response.setBuy_link(prediction.getBuy_link());
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }

    private DiseasePredictionResponse predictWithMultipart(MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", asResource(file));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            return restTemplate.postForObject(aiServiceUrl + "/predict", requestEntity, DiseasePredictionResponse.class);
        } catch (RestClientException ex) {
            if (!aiFallbackEnabled) {
                throw ex;
            }
            return fallbackPrediction();
        }
    }

    private DiseasePredictionResponse fallbackPrediction() {
        DiseasePredictionResponse response = new DiseasePredictionResponse();
        response.setDisease("AI service unavailable");
        response.setConfidence(0.0);
        response.setRecommendation("The image was saved, but plant disease inference is temporarily unavailable. Try again after the AI service is deployed.");
        response.setDescription("Disease detection service is not connected.");
        response.setPrevention("Inspect the crop manually, isolate visibly infected plants, and consult a local agronomist if symptoms spread.");
        response.setBuy_link("");
        return response;
    }

    private ByteArrayResource asResource(MultipartFile file) {
        try {
            return new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (IOException e) {
            throw new RuntimeException("Unable to read uploaded image", e);
        }
    }

    public List<DiseaseReportResponse> getReportsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reportRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(r -> {
                    DiseaseReportResponse dto = new DiseaseReportResponse();
                    dto.setId(r.getId());
                    dto.setImagePath(r.getImagePath());
                    dto.setDisease(r.getDisease());
                    dto.setConfidence(r.getConfidence());
                    dto.setRecommendation(r.getRecommendation());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

