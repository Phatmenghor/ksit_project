package com.menghor.ksit.feature.setting.controller;

import com.menghor.ksit.feature.attendance.dto.response.QrResponse;
import com.menghor.ksit.feature.attendance.service.AttendanceSessionService;
import com.menghor.ksit.feature.setting.dto.request.ImageUploadRequest;
import com.menghor.ksit.feature.setting.dto.response.ImageDto;
import com.menghor.ksit.feature.setting.dto.response.ImageResponse;
import com.menghor.ksit.feature.setting.service.ImageService;
import com.menghor.ksit.utils.QR.QrCodeGenerator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.UUID;

@Tag(name = "Images", description = "Upload and manage images")
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {
    
    private final ImageService imageService;
    private final QrCodeGenerator qrCodeGenerator;
    private final AttendanceSessionService sessionService;

    @PostMapping
    public ResponseEntity<ImageDto> uploadImage(@Valid @RequestBody ImageUploadRequest request) {
        log.info("Upload image request received");
        ImageDto uploadedImage = imageService.uploadImage(request);
        log.info("Image uploaded successfully. id={}", uploadedImage.getId());
        return new ResponseEntity<>(uploadedImage, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImageData(@PathVariable UUID id) {
ImageResponse imageResponse = imageService.getImageById(id);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(imageResponse.getType()))
                .body(imageResponse.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID id) {
        log.info("Delete image id={} request received", id);
        imageService.deleteImage(id);
        log.info("Image id={} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "generate-qr-image/{sessionId}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> regenerateQrCodeImage(@PathVariable Long sessionId) {
        log.info("Fetch QR code image for sessionId={} request received", sessionId);
        QrResponse response = sessionService.getQrCode(sessionId);
        String base64QrCode = qrCodeGenerator.generateQrCodeBase64(response.getQrCode(), 1080, 1080);
        byte[] qrCodeImage = Base64.getDecoder().decode(base64QrCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCodeImage);
    }
}