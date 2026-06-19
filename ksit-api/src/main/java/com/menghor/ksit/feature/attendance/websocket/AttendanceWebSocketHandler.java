package com.menghor.ksit.feature.attendance.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class AttendanceWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final Map<Long, Set<WebSocketSession>> scheduleSessions = new ConcurrentHashMap<>();
    private final Map<Long, Set<WebSocketSession>> attendanceSessionSessions = new ConcurrentHashMap<>();

    public AttendanceWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, String> params = parseQueryParams(session.getUri());
        log.info("WebSocket connection established. Session: {}, Params: {}", session.getId(), params);

        String scheduleIdStr = params.get("scheduleId");
        if (scheduleIdStr != null) {
            try {
                Long scheduleId = Long.parseLong(scheduleIdStr);
                scheduleSessions.computeIfAbsent(scheduleId, k -> ConcurrentHashMap.newKeySet()).add(session);
                session.getAttributes().put("scheduleId", scheduleId);
                log.info("WebSocket client registered for scheduleId={}", scheduleId);
            } catch (NumberFormatException e) {
                log.warn("Invalid scheduleId in WebSocket query: {}", scheduleIdStr);
            }
        }

        String sessionIdStr = params.get("sessionId");
        if (sessionIdStr != null) {
            try {
                Long sessionId = Long.parseLong(sessionIdStr);
                attendanceSessionSessions.computeIfAbsent(sessionId, k -> ConcurrentHashMap.newKeySet()).add(session);
                session.getAttributes().put("sessionId", sessionId);
                log.info("WebSocket client registered for sessionId={}", sessionId);
            } catch (NumberFormatException e) {
                log.warn("Invalid sessionId in WebSocket query: {}", sessionIdStr);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long scheduleId = (Long) session.getAttributes().get("scheduleId");
        if (scheduleId != null) {
            Set<WebSocketSession> sessions = scheduleSessions.get(scheduleId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    scheduleSessions.remove(scheduleId);
                }
            }
        }

        Long sessionId = (Long) session.getAttributes().get("sessionId");
        if (sessionId != null) {
            Set<WebSocketSession> sessions = attendanceSessionSessions.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    attendanceSessionSessions.remove(sessionId);
                }
            }
        }
        log.info("WebSocket connection closed. Session: {}, Status: {}", session.getId(), status);
    }

    public void broadcastSessionCreated(Long scheduleId, Object data) {
        log.info("Broadcasting session created event for scheduleId={}", scheduleId);
        sendToSchedule(scheduleId, new WebSocketMessagePayload("SESSION_CREATED", data));
    }

    public void broadcastAttendanceUpdated(Long sessionId, Object data) {
        log.info("Broadcasting attendance update event for sessionId={}", sessionId);
        sendToSession(sessionId, new WebSocketMessagePayload("ATTENDANCE_MARKED", data));
    }

    public void broadcastSessionFinalized(Long sessionId, Object data) {
        log.info("Broadcasting session finalized event for sessionId={}", sessionId);
        sendToSession(sessionId, new WebSocketMessagePayload("SESSION_FINALIZED", data));
    }

    private void sendToSchedule(Long scheduleId, WebSocketMessagePayload payload) {
        Set<WebSocketSession> sessions = scheduleSessions.get(scheduleId);
        if (sessions != null && !sessions.isEmpty()) {
            String json = serializePayload(payload);
            if (json != null) {
                sendMessageToSessions(sessions, json);
            }
        }
    }

    private void sendToSession(Long sessionId, WebSocketMessagePayload payload) {
        Set<WebSocketSession> sessions = attendanceSessionSessions.get(sessionId);
        if (sessions != null && !sessions.isEmpty()) {
            String json = serializePayload(payload);
            if (json != null) {
                sendMessageToSessions(sessions, json);
            }
        }
    }

    private String serializePayload(WebSocketMessagePayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize WebSocket payload", e);
            return null;
        }
    }

    private void sendMessageToSessions(Set<WebSocketSession> sessions, String json) {
        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message to session {}", session.getId(), e);
                }
            }
        }
    }

    private Map<String, String> parseQueryParams(URI uri) {
        if (uri == null || uri.getQuery() == null) {
            return Collections.emptyMap();
        }
        Map<String, String> params = new HashMap<>();
        String[] pairs = uri.getQuery().split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                params.put(pair.substring(0, idx), pair.substring(idx + 1));
            } else {
                params.put(pair, "");
            }
        }
        return params;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WebSocketMessagePayload {
        private String event;
        private Object data;
    }
}
