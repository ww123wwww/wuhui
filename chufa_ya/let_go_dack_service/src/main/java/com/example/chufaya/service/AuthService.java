package com.example.chufaya.service;

import com.example.chufaya.entity.User;
import com.example.chufaya.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    // 模拟验证码存储 (phone -> code)
    private final Map<String, String> verifyCodes = new ConcurrentHashMap<>();
    // 验证码过期时间存储 (phone -> 过期时间戳)
    private final Map<String, Long> verifyCodeExpiry = new ConcurrentHashMap<>();
    // 验证码有效期（毫秒），5分钟
    private static final long CODE_EXPIRE_MS = 5 * 60 * 1000;

    public Map<String, Object> register(String phone, String password, String nickname) {
        User existing = userMapper.findByPhone(phone);
        if (existing != null) {
            throw new RuntimeException("该手机号已注册");
        }

        User user = new User();
        user.setPhone(phone);
        user.setPasswordHash(password); // 明文存储
        user.setNickname(nickname != null && !nickname.isEmpty() ? nickname : "鸭友" + phone.substring(7));
        user.setDuckId("duck" + System.currentTimeMillis() % 100000);
        user.setFollowCount(0);
        user.setFansCount(0);
        user.setLikeCount(0);
        user.setStatus(1);

        userMapper.insert(user);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("nickname", user.getNickname());
        result.put("duckId", user.getDuckId());
        return result;
    }

    public Map<String, Object> login(String phone, String password) {
        User user = userMapper.findByPhone(phone);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 明文比较
        if (user.getPasswordHash() == null || !user.getPasswordHash().equals(password)) {
            throw new RuntimeException("密码错误");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("nickname", user.getNickname());
        result.put("duckId", user.getDuckId());
        result.put("avatarUrl", user.getAvatarUrl());
        return result;
    }

    public void sendVerifyCode(String phone) {
        String code = String.valueOf((int) ((Math.random() * 9 + 1) * 100000));
        verifyCodes.put(phone, code);
        verifyCodeExpiry.put(phone, System.currentTimeMillis() + CODE_EXPIRE_MS);
        System.out.println("========== 验证码 ==========");
        System.out.println("手机号: " + phone + ", 验证码: " + code);
        System.out.println("============================");
    }

    /**
     * 验证码登录：
     * - 已注册用户 → 直接登录，返回用户信息
     * - 新用户 → 不创建账号，返回 needSetPassword: true，前端跳转设置密码页
     */
    public Map<String, Object> loginByCode(String phone, String code) {
        String storedCode = verifyCodes.get(phone);
        Long expiry = verifyCodeExpiry.get(phone);

        if (storedCode == null || expiry == null) {
            throw new RuntimeException("请先获取验证码");
        }
        if (System.currentTimeMillis() > expiry) {
            verifyCodes.remove(phone);
            verifyCodeExpiry.remove(phone);
            throw new RuntimeException("验证码已过期，请重新获取");
        }
        if (!storedCode.equals(code)) {
            throw new RuntimeException("验证码错误");
        }

        verifyCodes.remove(phone);
        verifyCodeExpiry.remove(phone);

        User user = userMapper.findByPhone(phone);
        Map<String, Object> result = new HashMap<>();

        if (user != null) {
            // 已注册用户，直接登录
            result.put("userId", user.getUserId());
            result.put("nickname", user.getNickname());
            result.put("duckId", user.getDuckId());
            result.put("avatarUrl", user.getAvatarUrl());
            result.put("needSetPassword", false);
        } else {
            // 新用户，需要设置密码
            result.put("needSetPassword", true);
            result.put("phone", phone);
        }

        return result;
    }
}
