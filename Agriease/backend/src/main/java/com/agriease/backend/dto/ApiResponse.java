package com.agriease.backend.dto;

public class ApiResponse<T> {
    private T data;
    private Object error;
    private int status;

    public ApiResponse(T data, int status) {
        this.data = data;
        this.status = status;
    }

    public ApiResponse(Object error, int status, boolean isError) {
        this.error = error;
        this.status = status;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, 200);
    }

    public static <T> ApiResponse<T> success(T data, int status) {
        return new ApiResponse<>(data, status);
    }

    public static <T> ApiResponse<T> error(Object error, int status) {
        return new ApiResponse<>(error, status, true);
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Object getError() {
        return error;
    }

    public void setError(Object error) {
        this.error = error;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
