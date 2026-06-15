package com.menghor.ksit.exceptoins.error;

import com.menghor.ksit.exceptoins.response.ErrorObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;

@ControllerAdvice
@Slf4j
public class SecurityExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorObject> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Access denied at path={}: {}", path, ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN,
                "Access denied: You do not have permission to access this resource", path);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorObject> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Bad credentials at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password", path);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorObject> handleDisabledException(
            DisabledException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Disabled account login attempt at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Account is inactive. Please contact administrator", path);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorObject> handleLockedException(
            LockedException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Locked account login attempt at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Account has been deleted. Please contact administrator", path);
    }

    @ExceptionHandler(AccountExpiredException.class)
    public ResponseEntity<ErrorObject> handleAccountExpiredException(
            AccountExpiredException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Expired account login attempt at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Account has expired. Please contact administrator", path);
    }

    @ExceptionHandler(CredentialsExpiredException.class)
    public ResponseEntity<ErrorObject> handleCredentialsExpiredException(
            CredentialsExpiredException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Expired credentials at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Password has expired. Please change your password", path);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorObject> handleUsernameNotFoundException(
            UsernameNotFoundException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Username not found at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password", path);
    }

    @ExceptionHandler(InsufficientAuthenticationException.class)
    public ResponseEntity<ErrorObject> handleInsufficientAuthenticationException(
            InsufficientAuthenticationException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.warn("Insufficient authentication at path={}", path);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Authentication required. Please login to access this resource", path);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorObject> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        log.error("Authentication exception at path={}", path, ex);
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                "Authentication failed: " + ex.getMessage(), path);
    }

    private ResponseEntity<ErrorObject> buildErrorResponse(HttpStatus status, String message, String path) {
        ErrorObject errorObject = new ErrorObject();
        errorObject.setStatusCode(status.value());
        errorObject.setMessage(message);
        errorObject.setTimestamp(new Date());
        errorObject.setPath(path);
        return new ResponseEntity<>(errorObject, status);
    }
}