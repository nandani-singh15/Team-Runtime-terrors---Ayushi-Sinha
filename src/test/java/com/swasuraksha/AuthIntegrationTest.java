package com.swasuraksha;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swasuraksha.dto.LoginRequest;
import com.swasuraksha.dto.RegisterRequest;
import com.swasuraksha.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
    }

    @Test
    public void testUserRegistrationAndLoginFlow() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("testuser@swasuraksha.com");
        registerReq.setPassword("password123");
        registerReq.setFullName("Test User");
        registerReq.setPhoneNumber("+919876543210");

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andReturn();

        String regResponseStr = regResult.getResponse().getContentAsString();
        assertTrue(regResponseStr.contains("Registration successful"));
        assertTrue(regResponseStr.contains("testuser@swasuraksha.com"));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("testuser@swasuraksha.com");
        loginReq.setPassword("password123");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponseStr = loginResult.getResponse().getContentAsString();
        assertTrue(loginResponseStr.contains("Login successful"));
        
        String tokenKey = "\"token\":\"";
        int startIdx = loginResponseStr.indexOf(tokenKey) + tokenKey.length();
        int endIdx = loginResponseStr.indexOf("\"", startIdx);
        String jwtToken = loginResponseStr.substring(startIdx, endIdx);
        assertNotNull(jwtToken);

        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }
}
