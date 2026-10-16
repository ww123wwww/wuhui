package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FileController {

    @Value("${upload.path:./uploads}")
    private String uploadPath;

    @PostMapping("/upload/image")
    public UnifiedResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return UnifiedResponse.error("文件不能为空");
        }

        try {
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadPath, filename);

            Files.write(filePath, file.getBytes());

            String imageUrl = "http://localhost:8080/uploads/" + filename;

            return UnifiedResponse.success("上传成功", imageUrl);
        } catch (IOException e) {
            return UnifiedResponse.error("上传失败: " + e.getMessage());
        }
    }
}