package com.example.chufaya.dto;

public class UnifiedResponse<T> {
    private int code;
    private String message;
    private T data;

    public UnifiedResponse() {
    }

    public UnifiedResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> UnifiedResponse<T> success(String message, T data) {
        return new UnifiedResponse<>(200, message, data);
    }

    public static <T> UnifiedResponse<T> success(T data) {
        return new UnifiedResponse<>(200, "success", data);
    }

    public static <T> UnifiedResponse<T> error(String message) {
        return new UnifiedResponse<>(500, message, null);
    }

    public static <T> UnifiedResponse<T> error(int code, String message) {
        return new UnifiedResponse<>(code, message, null);
    }

    public static <T> UnifiedResponse<T> notFound(String message) {
        return new UnifiedResponse<>(404, message, null);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}