package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public UnifiedResponse<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        try {
            Map<String, Object> result = authService.register(request.getPhone(), request.getPassword(), request.getNickname());
            return UnifiedResponse.success("注册成功", result);
        } catch (Exception e) {
            return UnifiedResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public UnifiedResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> result = authService.login(request.getPhone(), request.getPassword());
            return UnifiedResponse.success("登录成功", result);
        } catch (Exception e) {
            return UnifiedResponse.error(e.getMessage());
        }
    }

    @PostMapping("/send-code")
    public UnifiedResponse<String> sendCode(@RequestBody SendCodeRequest request) {
        try {
            authService.sendVerifyCode(request.getPhone());
            return UnifiedResponse.success("验证码已发送", "success");
        } catch (Exception e) {
            return UnifiedResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login-by-code")
    public UnifiedResponse<Map<String, Object>> loginByCode(@RequestBody LoginByCodeRequest request) {
        try {
            Map<String, Object> result = authService.loginByCode(request.getPhone(), request.getCode());
            return UnifiedResponse.success("登录成功", result);
        } catch (Exception e) {
            return UnifiedResponse.error(e.getMessage());
        }
    }

    // Request DTOs
    public static class RegisterRequest {
        private String phone;
        private String password;
        private String nickname;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getNickname() { return nickname; }
        public void setNickname(String nickname) { this.nickname = nickname; }
    }

    public static class LoginRequest {
        private String phone;
        private String password;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SendCodeRequest {
        private String phone;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class LoginByCodeRequest {
        private String phone;
        private String code;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }
}
